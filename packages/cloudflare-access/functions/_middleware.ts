import type { PluginArgs } from "..";
import { generateLoginURL, getIdentity } from "../api";

type CloudflareAccessPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

const extractJWTFromRequest = (request: Request) =>
  request.headers.get("Cf-Access-Jwt-Assertion");

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
  ({ domain, aud }: { domain: string; aud: string }) =>
  async (
    request: Request
  ): Promise<{
    jwt: string;
    payload: object;
  }> => {
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

    const certsURL = new URL("/cdn-cgi/access/certs", domain);

    const unroundedSecondsSinceEpoch = Date.now() / 1000;

    const payloadObj = JSON.parse(textDecoder.decode(base64URLDecode(payload)));

    if (payloadObj.iss && payloadObj.iss !== certsURL.origin) {
      throw new Error("JWT issuer is incorrect.");
    }
    if (payloadObj.aud && payloadObj.aud !== aud) {
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

    const certsResponse = await fetch(certsURL.toString());
    const { keys } = (await certsResponse.json()) as {
      keys: ({
        kid: string;
      } & JsonWebKey)[];
      public_cert: { kid: string; cert: string };
      public_certs: { kid: string; cert: string }[];
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

    return { jwt, payload: payloadObj };
  };

export const onRequest: CloudflareAccessPagesPluginFunction = async ({
  request,
  pluginArgs: { domain, aud },
  data,
  next,
}) => {
  try {
    const validator = generateValidator({ domain, aud });

    const { jwt, payload } = await validator(request);

    data.cloudflareAccess = {
      JWT: {
        payload,
        getIdentity: () => getIdentity({ jwt, domain }),
      },
    };

    return next();
  } catch {}

  return new Response(null, {
    status: 302,
    headers: {
      Location: generateLoginURL({ redirectURL: request.url, domain, aud }),
    },
  });
};
