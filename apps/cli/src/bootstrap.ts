import "dotenv/config";
import { GraphQLClient } from "graphql-request";
import fs from "fs";
import { endpoint } from "./config";
import { login } from "./token";
import { createRole } from "./queries/createRole";
import { PermissionInput } from "./graphql.generated";

const client = new GraphQLClient(endpoint);

async function main() {
  await login(client);
  const initialRoles: [string, PermissionInput[]][] = [
    "super-admin",
    "presale",
  ].map((r) => [
    r,
    JSON.parse(fs.readFileSync(`./permissions/${r}.json`, "utf8")),
  ]);

  for (const [name, permissions] of initialRoles) {
    const roleId = await createRole(client, name, permissions);
    console.log(`Created role ${name} with id: ${roleId}`);
  }
}

main()
  .then(() => console.log("done"))
  .catch((err) => console.error(err));
