import { Toucan } from "toucan-js";
import type { PluginArgs, PluginData } from "..";

type SentryPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data & PluginData, PluginArgs>;

export const onRequest: SentryPagesPluginFunction = async (context) => {
  context.data.sentry = new Toucan({
    context,
    ...context.pluginArgs,
  });

  try {
    return await context.next();
  } catch (thrown) {
    context.data.sentry.captureException(thrown);
    throw thrown;
  }
};
