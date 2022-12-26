# 0xflick.com

Files for https://nameflick.com

Nameflick is an ENS utility app that extends the default ENS resolver when a new one that offers fast and cheap updates, community support and other features.

Work in progress

# Development

## Dependencies

- Node 16
- yarn
- sops

## Installation

**NOTE**: This code cannot be run as-is because it requires access to secrets and additional setup that is `.gitignore`. If you interested in running this locally please reach out to me for options.

```
yarn
```

You'll need to build the contracts:

```
yarn workspace @0xflick/contracts compile
```

## New feature package

From root:

```
yarn hygen generate feature new --name foo --description "foo does bar"
```

## WWW

See [apps/www](./apps/www)
