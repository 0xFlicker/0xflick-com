import { gql } from "apollo-server";
import {
  typeSchema as typeSchemaOpenSeaCollection,
  queryResolvers as queryResolversOpenSeaCollection,
  resolvers as resolversOpenSeaCollection,
} from "./collection";
import {
  typeSchema as typeSchemaOpenSeaAssets,
  queryResolvers as queryResolversOpenSeaAssets,
  resolvers as resolversOpenSeaAssets,
} from "./assets";

export const typeSchema = gql`
  ${typeSchemaOpenSeaCollection}
  ${typeSchemaOpenSeaAssets}
`;

export const queryResolvers = {
  ...queryResolversOpenSeaCollection,
  ...queryResolversOpenSeaAssets,
};

export const resolvers = {
  ...resolversOpenSeaCollection,
  ...resolversOpenSeaAssets,
};
