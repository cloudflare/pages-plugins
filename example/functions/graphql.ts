import graphQLPlugin from "@cloudflare/pages-plugin-graphql";
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from "graphql";

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return "Hello, world!";
        },
      },
    },
  }),
});

export const onRequest: PagesFunction = graphQLPlugin({ schema, graphql });
