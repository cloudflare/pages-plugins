import hCaptchaPlugin from "@cloudflare/pages-plugin-hcaptcha";

export const onRequest: PagesFunction[] = [
  hCaptchaPlugin({
    secret: "0x0000000000000000000000000000000000000000",
    sitekey: "10000000-ffff-ffff-ffff-000000000001",
    response: "10000000-aaaa-bbbb-cccc-000000000001",
  }),
  () => new Response("Validated your humanity!"),
];
