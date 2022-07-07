export async function onRequest({ request, next }) {
	// 1. Get the response from the request
	const response = await next();

	// First check that the response is valid, if it's not we don't need it since
	// Early hints is only for 200,301 or 302
	if (response.status !== 200) {
		console.log(`${request.url} returned (${response.status}), skipping`);
		return response;
	}

	const contentType = response.headers.get("content-type");

	if (!contentType.includes("text/html") || contentType === null) {
		return response;
	}

	const links = [];

	// Check for the supported formats then add them to the preloads array
	class ElementHandler {
		element(element) {
			const url = element.getAttribute("href");
			const rel = element.getAttribute("rel");
			const as = element.getAttribute("as");
			if (url && !url.startsWith("data:") && !url.startsWith("http")) {
				links.push({ url, rel, as });
			}
		}
	}

	// Create a new HTMLRewriter object and call the on method on the ElementHandler

	const addwithRewriter = new HTMLRewriter()
		.on("link[rel=preconnect],link[rel=preload]", new ElementHandler())
		.transform(response);

	const body = await addwithRewriter.text();
	const headers = new Headers(addwithRewriter.headers);

	// 2. Create a new response with the preloads
	links.forEach(({ url, rel, as }) => {
		// TODO: Figure out `rel` and `as`
		let link = `<${url}>; rel="${rel}"`;
		if (as) {
			link += `; as=${as}`;
		}
		headers.append("Link", link);
	});

	return new Response(body, { ...response, headers: headers });
}
