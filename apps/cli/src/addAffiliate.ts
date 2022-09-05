import "dotenv/config";
import { GraphQLClient } from "graphql-request";
import fs from "fs";
import { endpoint } from "./config";
import { login } from "./token";
import { createRole } from "./queries/createRole";
import {
  PermissionInput,
  PermissionAction,
  PermissionResource,
} from "./graphql.generated";

const client = new GraphQLClient(endpoint);

const affiliateAddress = process.argv[2];
if (!affiliateAddress) {
  console.error("Please provide an affiliate address");
  process.exit(1);
}
async function main() {
  await login(client);
  await createRole(client, "presale", [
    {
      resource: PermissionResource.Presale,
      action: PermissionAction.Use,
      identifier: affiliateAddress,
    },
  ]);
}

main()
  .then(() => console.log("done"))
  .catch((err) => console.error(err));
