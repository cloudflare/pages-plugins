export type PluginArgs = {
  secret: string;
  response?: string;
  remoteip?: string;
  sitekey?: string;
  onError?: PagesFunction<unknown, any, PluginData>;
};

interface hCaptchaSuccess {
  success: true;
  challenge_ts: string;
  hostname: string;
  credit?: boolean;
  "error-codes"?: string[];
  score?: number;
  score_reason?: string[];
}

interface hCaptchaFailure {
  success: false;
  "error-codes": string[];
}

export type PluginData = {
  hCaptcha: hCaptchaSuccess | hCaptchaFailure;
};

export default function (args: PluginArgs): PagesFunction;
