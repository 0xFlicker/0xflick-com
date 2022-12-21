---
to: "<%= graphql ? `packages/feature-${name}/codegen.yml` : null %>"
---
overwrite: true
schema: "../../packages/graphql/schema.graphql"
documents: "src/**/*.graphql"
generates:
  src/graphql/types.ts:
    - typescript
  src/:
    preset: near-operation-file
    presetConfig:
      extension: .generated.tsx
      baseTypesPath: graphql/types.ts
    plugins:
      - typescript-operations
      - typescript-react-apollo
  ./src/graphql/graphql.schema.json:
    plugins:
      - "introspection"
