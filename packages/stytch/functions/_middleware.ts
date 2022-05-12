import { parse } from "cookie";
import type { PluginArgs, PluginData } from "..";

type StytchPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data & PluginData, PluginArgs>;

type Payload = (
  | {
      session_token: string;
    }
  | { session_jwt: string }
) & { session_duration_minutes?: number };

export const onRequest: StytchPagesPluginFunction = async ({
  request,
  pluginArgs,
  data,
  next,
}) => {
  const url = `${pluginArgs.env}sessions/authenticate`;

  const cookies = parse(request.headers.get("Cookie"));

  let payload: Payload = {
    session_token: cookies.session_token,
  };

  if (pluginArgs.session_token) {
    payload = { session_token: pluginArgs.session_token };
  } else if (pluginArgs.session_jwt) {
    payload = { session_jwt: pluginArgs.session_jwt };
  }

  if (pluginArgs.session_duration_minutes) {
    payload.session_duration_minutes = pluginArgs.session_duration_minutes;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${pluginArgs.project_id}:${pluginArgs.secret}`
      )}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    data.stytch = {
      session: await response.json(),
    };

    return next();
  }

  return new Response(null, { status: 403 });
};
