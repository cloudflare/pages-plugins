import type { PluginArgs } from "..";

type GoogleChatPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

const extractJWTFromRequest = (request: Request) => {
  return request.headers.get("Authorization").split("Bearer ")[1];
};

// Adapted slightly from https://github.com/cloudflare/workers-access-external-auth-example
const base64URLDecode = (s: string) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  return new Uint8Array(
    Array.prototype.map.call(atob(s), (c: string) => c.charCodeAt(0))
  );
};

const asciiToUint8Array = (s: string) => {
  let chars = [];
  for (let i = 0; i < s.length; ++i) {
    chars.push(s.charCodeAt(i));
  }
  return new Uint8Array(chars);
};

const generateValidator =
  ({ aud }: { aud?: string }) =>
  async (request: Request) => {
    const jwt = extractJWTFromRequest(request);

    const parts = jwt.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT does not have three parts.");
    }
    const [header, payload, signature] = parts;

    const textDecoder = new TextDecoder("utf-8");
    const { kid, alg, typ } = JSON.parse(
      textDecoder.decode(base64URLDecode(header))
    );
    if (typ !== "JWT" || alg !== "RS256") {
      throw new Error("Unknown JWT type or algorithm.");
    }

    const unroundedSecondsSinceEpoch = Date.now() / 1000;

    const payloadObj = JSON.parse(textDecoder.decode(base64URLDecode(payload)));

    if (
      payloadObj.iss &&
      payloadObj.iss !== "chat@system.gserviceaccount.com"
    ) {
      throw new Error("JWT issuer is incorrect.");
    }
    if (payloadObj.aud && aud && payloadObj.aud !== aud) {
      throw new Error("JWT audience is incorrect.");
    }
    if (
      payloadObj.exp &&
      Math.floor(unroundedSecondsSinceEpoch) >= payloadObj.exp
    ) {
      throw new Error("JWT has expired.");
    }
    if (
      payloadObj.nbf &&
      Math.ceil(unroundedSecondsSinceEpoch) < payloadObj.nbf
    ) {
      throw new Error("JWT is not yet valid.");
    }

    const keysResponse = await fetch(
      "https://www.googleapis.com/service_accounts/v1/jwk/chat@system.gserviceaccount.com"
    );
    const { keys } = (await keysResponse.json()) as {
      keys: ({
        kid: string;
      } & JsonWebKey)[];
    };
    if (!keys) {
      throw new Error("Could not fetch signing keys.");
    }
    const jwk = keys.find((key) => key.kid === kid);
    if (!jwk) {
      throw new Error("Could not find matching signing key.");
    }
    if (jwk.kty !== "RSA" || jwk.alg !== "RS256") {
      throw new Error("Unknown key type of algorithm.");
    }

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const verified = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      base64URLDecode(signature),
      asciiToUint8Array(`${header}.${payload}`)
    );
    if (!verified) {
      throw new Error("Could not verify JWT.");
    }
  };

export const onRequestPost: GoogleChatPagesPluginFunction = async ({
  request,
  pluginArgs,
}) => {
  try {
    const validator = generateValidator({
      aud: "aud" in pluginArgs ? pluginArgs.aud : undefined,
    });

    await validator(request);

    const eventHandler =
      "handleEvent" in pluginArgs ? pluginArgs.handleEvent : pluginArgs;

    const message = await eventHandler(await request.json());

    if (message !== undefined) {
      return new Response(JSON.stringify(message), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null);
  } catch {}

  return new Response(null, { status: 403 });
};
