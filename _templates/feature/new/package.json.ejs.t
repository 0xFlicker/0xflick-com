---
to: packages/feature-<%= name %>/package.json
---
{
  "name": "@0xflick/feature-<%= name %>",
  "version": "1.0.0",
  "description": "<%= description %>",
  "main": "src/index.ts",
  "author": "0xflick <github@0xflick.xyz>",
  "license": "MIT",
  "scripts": {
<% if(graphql){ -%>
    "generate": "yarn generate:schema && yarn generate:introspection && yarn generate:types",
    "generate:schema": "yarn --cwd ../../packages/graphql schema:build",
    "generate:introspection": "node scripts/possibleTypes.cjs",
    "generate:types": "graphql-codegen --config codegen.yml"
<% } -%>
  },
  "dependencies": {
<% if(graphql){ -%>
    "@apollo/client": "^3.7.2",
<% } -%>
    "@mui/material": "^5.11.0",
<% if(graphql){ -%>
    "graphql": "16.5.0",
    "graphql-tag": "^2.12.6",
<% } -%>
    "react": "^18.2.0"
  },
  "devDependencies": {
<% if(graphql){ -%>
    "@graphql-codegen/cli": "2.11.6",
    "@graphql-codegen/near-operation-file-preset": "^2.4.1",
    "@graphql-codegen/typed-document-node": "^2.3.3",
    "@graphql-codegen/typescript": "2.7.3",
    "@graphql-codegen/typescript-operations": "2.5.3",
    "@graphql-codegen/typescript-react-apollo": "^3.3.3",
<% } -%>
    "typescript": "^4.9.4"
  }
}
