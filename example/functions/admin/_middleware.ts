import type { PluginData as CloudflareAccessPluginData } from "@cloudflare/pages-plugin-cloudflare-access";
import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";
import type { PluginData as SentryPluginData } from "@cloudflare/pages-plugin-sentry";

export const onRequest = [
  cloudflareAccessPlugin({
    domain: "https://test.cloudflareaccess.com",
    aud: "97e2aae120121f902df8bc99fc345913ab186d174f3079ea729236766b2e7c4a",
  }),
  (async ({ data, next }) => {
    const identity = await data.cloudflareAccess.JWT.getIdentity();

    data.sentry.setUser({
      id:
        data.cloudflareAccess.JWT.payload.sub ||
        data.cloudflareAccess.JWT.payload.common_name,
      username: identity.name,
      ip_address: identity.ip,
      email: data.cloudflareAccess.JWT.payload.email,
    });

    return next();
  }) as PagesFunction<
    unknown,
    any,
    SentryPluginData & CloudflareAccessPluginData
  >,
];
