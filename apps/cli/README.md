# 0xflick/cli

Various admin and CLI methods that interface with a running graphql

## Usage

Start with making a copy of `.env.DEPLOYMENT.example` to `.env`. If you are going to run any commands that require authentication then a private key will be needed.

## Commands

### Bootstrap

Configures the super-admin role for a newly deployed backend

execution:

```
yarn bootstrap
```

requires:

- private key
- private key must resolve to the admin ENS defined by the backend

### Token

Fetches an auth token for use in graphql playground or other API usage

execution:

```
yarn token
```

requires:

- private key

### Add affiliate

Adds an address as an affiliate for a presale mint, by creating a presale role with the address as an identifier. Useful for tracking at mint the forwarder

execution:

```
yarn add-affiliate <address>
```

requires:

- private key
- requires admin or create-role permission
