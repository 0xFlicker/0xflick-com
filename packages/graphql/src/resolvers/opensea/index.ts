import { gql } from "apollo-server";
import {
  typeSchema as typeSchemaOpenSeaCollection,
  queryResolvers as queryResolversOpenSeaCollection,
  resolvers as resolversOpenSeaCollection,
} from "./collection";

export const typeSchema = gql`
  ${typeSchemaOpenSeaCollection}
`;

export const queryResolvers = {
  ...queryResolversOpenSeaCollection,
};

export const resolvers = {
  ...resolversOpenSeaCollection,
};
