import type { GraphQLClient } from "graphql-request";
import { getSdk, PermissionInput } from "../graphql.generated";

export async function createRole(
  client: GraphQLClient,
  roleName: string,
  permissions: PermissionInput[]
) {
  const response = await getSdk(client).createRole({ roleName, permissions });
  return response.createRole.id;
}
