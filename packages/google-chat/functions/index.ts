import { KJUR } from "jsrsasign";
import type { PluginArgs } from "..";

type GoogleChatPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

const extractJWTFromRequest = (request: Request) => {
  return request.headers.get("Authorization").split("Bearer ")[1];
};

const isAuthorized = async (request: Request) => {
  const jwt = extractJWTFromRequest(request);

  const { kid } = KJUR.jws.JWS.parse(jwt)
    .headerObj as KJUR.jws.JWS.JWSResult["headerObj"] & { kid: string };

  const keysResponse = await fetch(
    "https://www.googleapis.com/service_accounts/v1/metadata/x509/chat@system.gserviceaccount.com"
  );
  const keys = (await keysResponse.json()) as Record<string, string>;
  const cert = Object.entries(keys).find(([id, cert]) => id === kid)[1];

  return KJUR.jws.JWS.verifyJWT(jwt, cert, { alg: ["RS256"] });
};

export const onRequestPost: GoogleChatPagesPluginFunction = async ({
  request,
  pluginArgs,
}) => {
  let authorized = false;
  try {
    authorized = await isAuthorized(request);
  } catch {}

  if (!authorized) {
    return new Response(null, { status: 403 });
  }

  const message = await pluginArgs(await request.json());

  if (message !== undefined) {
    return new Response(JSON.stringify(message), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null);
};
