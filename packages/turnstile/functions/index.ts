import type { PluginArgs, PluginData } from "..";

type turnstilePagesPluginFunction<
	Env = unknown,
	Params extends string = any,
	Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data & PluginData, PluginArgs>;

const errorStringMap = {
	"missing-input-secret": "The secret parameter was not passed.",

	"invalid-input-secret": "The secret parameter was invalid or did not exist.",

	"missing-input-response": "The response parameter was not passed.",

	"invalid-input-response": "The response parameter is invalid or has expired.",

	"invalid-widget-id":
		"The widget ID extracted from the parsed site secret key was invalid or did not exist.",

	"invalid-parsed-secret":
		"The secret extracted from the parsed site secret key was invalid.",

	"bad-request": "The request was rejected because it was malformed.",

	"timeout-or-duplicate":
		"The response parameter has already been validated before.",

	"invalid-idempotency-key": "The provided idempotendy key was malformed.",

	"internal-error":
		"An internal error happened while validating the response. The request can be retried.",
}

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const onRequest: turnstilePagesPluginFunction = async (context) => {
	const {
		secret,
		response: turnstileResponse = (await context.request.clone().formData())
			.get("cf-turnstile-response")
			.toString(),
		remoteip = context.request.headers.get("CF-Connecting-IP"),
		idempotency_key: idempotencyKey,
		onError,
	} = context.pluginArgs;

	const formData = new FormData();
	formData.set("secret", secret);
	formData.set("response", turnstileResponse);
	if (remoteip) formData.set("remoteip", remoteip);
	if (idempotencyKey) formData.set("idempotency_key", idempotencyKey);

	const response = await fetch(
		SITEVERIFY_URL,
		{
			method: "POST",
			body: formData,
		}
	);
	context.data.turnstile = await response.json();

	if (!context.data.turnstile.success) {
		if (onError) {
			return onError(context);
		} else {
			const descriptions = context.data.turnstile["error-codes"].map(
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
