import headersPlugin from "@cloudflare/pages-plugin-headers";
import honeycombPlugin from "@cloudflare/pages-plugin-honeycomb";
import mailchannelsPlugin from "@cloudflare/pages-plugin-mailchannels";

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
  mailchannelsPlugin({
    personalizations: ({ formData }) => [
      {
        to: [{ name: "Greg Brimble", email: "hello@gregbrimble.com" }],
        bcc: [
          {
            name: formData.get("name").toString(),
            email: formData.get("email").toString(),
          },
        ],
      },
    ],
    from: ({ formData }) => ({
      name: formData.get("name").toString(),
      email: formData.get("email").toString(),
    }),
    respondWith: () =>
      new Response(null, {
        status: 302,
        headers: { Location: "/thank-you" },
      }),
  }),
];
