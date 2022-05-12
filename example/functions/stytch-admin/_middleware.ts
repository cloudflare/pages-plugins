import stytchPlugin from "@cloudflare/pages-plugin-stytch";
import { envs } from "@cloudflare/pages-plugin-stytch/api";

export const onRequest = stytchPlugin({
  project_id: "project-test-747d6ca9-b21e-4c44-a245-28df7451f1da",
  secret: "secret-test-XlSSLKr8Yf5UrY26Gj9Ln61CMVwqaYoSd0E=",
  env: envs.test,
});
