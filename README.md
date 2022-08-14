# 0xflick.com

Files for https://0xflick.com

Sharing as an example of making dynamic web3 websites with a backend.

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

## WWW

See [apps/www](./apps/www)
