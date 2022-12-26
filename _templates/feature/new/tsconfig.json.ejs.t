---
to: packages/feature-<%= name %>/tsconfig.json
---
{
  "compilerOptions": {
    "target": "ES2015",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "jsx": "preserve",
    "paths": {
      "@0xflick/models": ["../../packages/models/src/index"],
      "@0xflick/graphql": ["../../packages/backend/src/index"],
      "@0xflick/feature-web3": ["../../packages/feature-web3/src/index"],
      "@0xflick/utils": ["../../packages/utils/src/index"]
    },
    "plugins": [
<% if(locals.graphql){ -%>
      {
        "name": "ts-graphql-plugin",
        "schema": "../../packages/graphql/schema.graphql",
        "tag": "gql"
      }
<% } -%>
    ]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["./node_modules"],
  "references": [
    {
      "path": "../../packages/models"
    },
    {
      "path": "../../packages/graphql"
    },
    {
      "path": "../../packages/feature-web3"
    },
    {
      "path": "../../packages/utils"
    }
  ]
}
