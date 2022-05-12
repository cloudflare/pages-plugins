import { RequestTracer, resolve } from "@cloudflare/workers-honeycomb-logger";
import type { PluginArgs, PluginData } from "..";

type HoneycombPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data & PluginData, PluginArgs>;

type OutgoingFetcher = { fetch: typeof fetch };

function proxyFetch(
  obj: OutgoingFetcher,
  tracer: RequestTracer,
  name: string
): OutgoingFetcher {
  obj.fetch = new Proxy(obj.fetch, {
    apply: (target, thisArg, argArray) => {
      const info = argArray[0] as Request;
      const input = argArray[1] as RequestInit;
      const request = new Request(info, input);
      const childSpan = tracer.startChildSpan(request.url, name);

      const traceHeaders = childSpan.eventMeta.trace.getHeaders();
      request.headers.set("traceparent", traceHeaders.traceparent);
      if (traceHeaders.tracestate)
        request.headers.set("tracestate", traceHeaders.tracestate);

      childSpan.addRequest(request);
      const promise = Reflect.apply(target, thisArg, [
        request,
      ]) as Promise<Response>;
      promise
        .then((response) => {
          childSpan.addResponse(response);
          childSpan.finish();
        })
        .catch((reason) => {
          childSpan.addData({ exception: reason });
          childSpan.finish();
        });
      return promise;
    },
  });
  return obj;
}

function proxyGet(fn: Function, tracer: RequestTracer, do_name: string) {
  return new Proxy(fn, {
    apply: (target, thisArg, argArray) => {
      const obj = Reflect.apply(target, thisArg, argArray);
      return proxyFetch(obj, tracer, do_name);
    },
  });
}

function proxyNS(
  dns: DurableObjectNamespace,
  tracer: RequestTracer,
  do_name: string
) {
  return new Proxy(dns, {
    get: (target, prop, receiver) => {
      const value = Reflect.get(target, prop, receiver);
      if (prop === "get") {
        return proxyGet(value, tracer, do_name).bind(dns);
      } else {
        return value ? value.bind(dns) : undefined;
      }
    },
  });
}

function proxyEnv(env: any, tracer: RequestTracer): any {
  return new Proxy(env, {
    get: (target, prop, receiver) => {
      const value = Reflect.get(target, prop, receiver);
      if (value && value.idFromName) {
        return proxyNS(value, tracer, prop.toString());
      } else if (value && value.fetch) {
        return proxyFetch(value, tracer, prop.toString());
      } else {
        return value;
      }
    },
  });
}

export const onRequest: HoneycombPagesPluginFunction = async ({
  request,
  env,
  next,
  pluginArgs,
  data,
  waitUntil,
}) => {
  const config = resolve(pluginArgs);
  data.honeycomb = { tracer: new RequestTracer(request, config) };

  proxyEnv(env, data.honeycomb.tracer);

  try {
    const response = await next();
    data.honeycomb.tracer.finishResponse(response);
    waitUntil(data.honeycomb.tracer.sendEvents());
    return response;
  } catch (thrown) {
    data.honeycomb.tracer.finishResponse(undefined, thrown);
    waitUntil(data.honeycomb.tracer.sendEvents());
    throw thrown;
  }
};
