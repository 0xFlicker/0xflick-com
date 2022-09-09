import { gql } from "apollo-server-core";

export const typeSchema = gql`
  type Affiliate {
    address: String!
    slug: String!
    role: Role!
    deactivated: Boolean
  }

  type AffiliateQuery {
    address: ID!
    slugs: [String!]!
    role: Role!
  }

  type AffiliateMutation {
    address: ID!

    deactivate(slug: String!): Boolean!

    slugs: [String!]!
    role: Role!
  }
`;
