import type { PluginArgs } from "..";

type HeadersPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

export const onRequest: HeadersPagesPluginFunction = async ({
  next,
  pluginArgs,
}) => {
  const headers = new Headers(pluginArgs);

  const response = await next();

  for (const [name, value] of headers.entries()) {
    response.headers.set(name, value);
  }

  return response;
};
