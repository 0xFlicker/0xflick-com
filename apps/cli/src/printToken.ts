import "dotenv/config";
import { GraphQLClient } from "graphql-request";
import { endpoint } from "./config";
import { login } from "./token";

const client = new GraphQLClient(endpoint);

async function main() {
  console.log(await login(client));
}

main()
  .then(() => console.log("done"))
  .catch((err) => console.error(err));
