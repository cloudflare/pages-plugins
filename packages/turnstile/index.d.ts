export type PluginArgs = {
  secret: string;
  response?: string;
  remoteip?: string;
  idempotency_key?: string;
  onError?: PagesFunction<unknown, any, PluginData>;
};

interface TurnstileSuccess {
  success: true;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

interface TurnstileFailure {
  success: false;
  "error-codes": string[];
}

export type PluginData = {
  turnstile: TurnstileSuccess | TurnstileFailure;
};

export default function (args: PluginArgs): PagesFunction;
