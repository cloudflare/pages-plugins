import { KJUR } from "jsrsasign"; // TODO: Switch out for more efficient/Access reference verification
import type { PluginArgs } from "..";
import { generateLoginURL, getIdentity } from "../api";

type CloudflareAccessPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

const extractJWTFromRequest = (request: Request) => {
  return request.headers.get("Cf-Access-Jwt-Assertion");
};

const generateValidator =
  ({ domain, aud }: { domain: string; aud: string }) =>
  async (
    request: Request
  ): Promise<false | { jwt: string; payload: object }> => {
    const jwt = extractJWTFromRequest(request);

    const { payloadObj, headerObj } = KJUR.jws.JWS.parse(jwt);
    const { kid } = headerObj as KJUR.jws.JWS.JWSResult["headerObj"] & {
      kid: string;
    };

    const certsURL = new URL("/cdn-cgi/access/certs", domain);
    const certsResponse = await fetch(certsURL.toString());
    const { public_certs } = (await certsResponse.json()) as {
      keys: Record<string, string>[];
      public_cert: { kid: string; cert: string };
      public_certs: { kid: string; cert: string }[];
    };
    const cert = public_certs.find(({ kid: id }) => id === kid).cert;

    const isValid = KJUR.jws.JWS.verifyJWT(jwt, cert, {
      alg: ["RS256"],
      aud: [aud],
    });

    if (!isValid) {
      return false;
    }

    return { jwt, payload: payloadObj };
  };

export const onRequest: CloudflareAccessPagesPluginFunction = async ({
  request,
  pluginArgs: { domain, aud },
  data,
  next,
}) => {
  let verifiedJWT: Awaited<ReturnType<ReturnType<typeof generateValidator>>> =
    false;

  try {
    const validator = generateValidator({ domain, aud });

    verifiedJWT = await validator(request);
  } catch {}

  if (verifiedJWT === false) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: generateLoginURL({ redirectURL: request.url, domain, aud }),
      },
    });
  }

  const { jwt, payload } = verifiedJWT;

  data.cloudflareAccess = {
    JWT: {
      payload,
      getIdentity: () => getIdentity({ jwt, domain }),
    },
  };

  return next();
};
