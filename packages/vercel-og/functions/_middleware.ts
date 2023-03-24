import { ImageResponse } from "../api";
import type { PluginArgs } from "..";

type vercelOGPagesPluginFunction<
	Env = unknown,
	Params extends string = any,
	Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

function escapeRegex(string: string) {
	return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

const responseIsValidHTML = (response: Response) =>
	response.ok && response.headers.get("Content-Type")?.includes("text/html");

export const onRequestGet: vercelOGPagesPluginFunction = async ({
	request,
	pluginArgs,
	next,
}) => {
	const {
		imagePathSuffix,
		extractors: htmlRewriterHandlers,
		component: Component,
		options,
		onError = () => new Response(null, { status: 404 }),
		autoInject,
	} = pluginArgs;
	const url = new URL(request.url);

	const match = url.pathname.match(`(.*)${escapeRegex(imagePathSuffix)}`);
	if (match) {
		const props = {
			pathname: match[1],
		};

		if (htmlRewriterHandlers) {
			const response = await next(match[1]);

			if (!responseIsValidHTML(response)) {
				return onError();
			}

			let htmlRewriter = new HTMLRewriter();

			if (htmlRewriterHandlers.onDocument) {
				htmlRewriter = htmlRewriter.onDocument(
					htmlRewriterHandlers.onDocument(props)
				);
			}

			if (htmlRewriterHandlers.on) {
				for (const [selector, handlerGenerators] of Object.entries(
					htmlRewriterHandlers.on
				)) {
					htmlRewriter = htmlRewriter.on(selector, handlerGenerators(props));
				}
			}

			await htmlRewriter.transform(response).arrayBuffer();
		}

		return new ImageResponse({ type: Component, props, key: null }, options);
	} else if (autoInject) {
		const response = await next();

		if (!responseIsValidHTML(response)) {
			return response;
		}

		return new HTMLRewriter()
			.on("head", {
				element(element) {
					if (autoInject.openGraph) {
						element.append(
							`<meta property="og:image" content="${
								url.href
							}${imagePathSuffix}" /><meta property="og:image:height" content="${
								630 || options.height
							}" /><meta property="og:image:width" content="${
								1200 || options.width
							}" />`,
							{ html: true }
						);
					}
				},
			})
			.transform(response);
	}

	return next();
};
