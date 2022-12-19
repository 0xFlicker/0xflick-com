---
to: packages/<%= name %>/package.json
---
{
  "name": "@0xflick/<%= name %>",
  "version": "1.0.0",
  "description": "<%= description %>",
  "main": "src/index.ts",
  "author": "0xflick <github@0xflick.xyz>",
  "license": "MIT",
  "dependencies": {
    "@apollo/client": "^3.7.2",
    "@mui/material": "^5.11.0",
    "@reduxjs/toolkit": "^1.9.1",
    "graphql": "^16.6.0",
    "react": "^18.2.0"
  }
}
