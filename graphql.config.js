module.exports = {
  projects: {
    bootstrap: {
      schema: ['apps/bootstrap/schema.graphql'],
      documents: ['apps/bootstrap/src/**/*.graphql'],
    },
    www: {
      schema: ['apps/www/schema.graphql'],
      documents: ['apps/www/src/**/*.graphql'],
    },
    functions: {
      schema: ['packages/graphql/schema.graphql'],
      documents: ['apps/functions/src/**/*.graphql'],
    },
  },
};
