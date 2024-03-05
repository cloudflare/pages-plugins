import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

export const onRequestGet = async () => {
  return new ImageResponse(<div>Hello, world!</div>);
};
