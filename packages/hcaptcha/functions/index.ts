import type { PluginArgs, PluginData } from "..";

type hCaptchaPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data & PluginData, PluginArgs>;

const errorStringMap = {
  "missing-input-secret	": "Your secret key is missing.",

  "invalid-input-secret": "Your secret key is invalid or malformed.",

  "missing-input-response":
    "The response parameter (verification token) is missing.",

  "invalid-input-response":
    "The response parameter (verification token) is invalid or malformed.",

  "bad-request": "The request is invalid or malformed.",

  "invalid-or-already-seen-response":
    "The response parameter has already been checked, or has another issue.",

  "not-using-dummy-passcode":
    "You have used a testing sitekey but have not used its matching secret.",

  "sitekey-secret-mismatch":
    "The sitekey is not registered with the provided secret.",
};

export const onRequest: hCaptchaPagesPluginFunction = async (context) => {
  const {
    secret,
    response: hCaptchaResponse = (await context.request.clone().formData())
      .get("h-captcha-response")
      .toString(),
    remoteip = context.request.headers.get("CF-Connecting-IP"),
    sitekey,
    onError,
  } = context.pluginArgs;

  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", hCaptchaResponse);
  if (remoteip) formData.set("remoteip", remoteip);
  if (sitekey) formData.set("sitekey", sitekey);

  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    body: formData,
  });
  context.data.hCaptcha = await response.json();

  if (!context.data.hCaptcha.success) {
    if (onError) {
      return onError(context);
    } else {
      const descriptions = context.data.hCaptcha["error-codes"].map(
        (errorCode) =>
          errorStringMap[errorCode] || "An unexpected error has occurred."
      );

      return new Response(
        `Could not confirm your humanity.

${descriptions.join("\n")}.

Please try again.`,
        { status: 400 }
      );
    }
  }

  return context.next();
};
