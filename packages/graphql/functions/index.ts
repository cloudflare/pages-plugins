import type { PluginArgs } from "..";
import * as Piecemeal from 'piecemeal/worker';

type GraphQLPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

const isAsyncGenerator = (input: unknown): input is AsyncGenerator =>
	// @ts-ignore
	input[Symbol.asyncIterator] < "u";

const extractGraphQLQueryFromRequest = async (request: Request) => {
  if (/application\/graphql/i.test(request.headers.get("Content-Type"))) {
    return { source: await request.text() };
  }

  const { query, variables, operationName } = await request.json();

  return {
    source: query,
    variableValues: variables,
    operationName,
  };
};

export const onRequestPost: GraphQLPagesPluginFunction = async (context) => {
  const { request, pluginArgs } = context;
  const { schema, graphql } = pluginArgs;

  const result = await graphql({
    schema,
    ...(await extractGraphQLQueryFromRequest(request)),
  });

  if (isAsyncGenerator(result)) {
    const { response, pipe } = Piecemeal.stream(result);
    context.waitUntil(pipe());
    return response;
  }

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
};

export { onRequest } from "assets:../static";
