import type { graphql, GraphQLArgs } from "graphql";

export type PluginArgs = { graphql: typeof graphql } & GraphQLArgs;

export default function (args: PluginArgs): PagesFunction;
