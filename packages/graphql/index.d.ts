import type { graphql, GraphQLSchema } from "graphql";

export type PluginArgs = { schema: GraphQLSchema; graphql: typeof graphql };

export default function (args: PluginArgs): PagesFunction;
