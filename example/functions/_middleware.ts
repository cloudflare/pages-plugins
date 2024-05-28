import headersPlugin from "@cloudflare/pages-plugin-headers";
import honeycombPlugin from "@cloudflare/pages-plugin-honeycomb";

export const onRequest: PagesFunction[] = [
  honeycombPlugin({
    apiKey: "",
    dataset: "pages-plugin-example",
  }),
  ({ next }) => {
    try {
      return next();
    } catch (thrown) {
      return new Response(`${thrown}`, { status: 500 });
    }
  },
  // sentryPlugin({
  //   // dsn: "https://sentry.io/xyz",
  // }),
  headersPlugin({
    "Access-Control-Allow-Origin": "*",
  }),
];
