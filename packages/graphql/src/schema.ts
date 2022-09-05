import "dotenv/config";
import fs from "fs";
import { resolve } from "path";
import { typeDefs } from ".";
import { getIntrospectionQuery, buildClientSchema, printSchema } from "graphql";
import { ApolloServer } from "apollo-server";

Promise.resolve()
  .then(async () => {
    const apollo = new ApolloServer({
      typeDefs,
      introspection: true,
    });
    const { data } = await apollo.executeOperation({
      query: getIntrospectionQuery(),
    });
    const schema = buildClientSchema(data as any);
    const printableSchema = printSchema(schema);
    await Promise.all([
      fs.promises.writeFile(
        resolve(__dirname, "../../../apps/www/schema.graphql"),
        printableSchema,
        "utf8"
      ),
      fs.promises.writeFile(
        resolve(__dirname, "../../../apps/cli/schema.graphql"),
        printableSchema,
        "utf8"
      ),
      fs.promises.writeFile(
        resolve(__dirname, "../schema.graphql"),
        printableSchema,
        "utf8"
      ),
    ]);
  })
  .catch((err) => console.error(err));
