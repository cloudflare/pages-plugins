import type {
  RequestTracer,
  Config,
} from "@cloudflare/workers-honeycomb-logger";

export type PluginArgs = Config & { apiKey: string; dataset: string };

export type PluginData = { honeycomb: { tracer: RequestTracer } };

export default function (args: PluginArgs): PagesFunction;
