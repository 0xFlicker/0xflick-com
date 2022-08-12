# Introduction

The SoA contracts

# Prerequisites

Install:

- Node 16
- yarn

Run:

```
yarn
```

# Configuration

Copy the `.env.example` file:

```
cp .env.example .env
```

This is enough to get a local hardhat node running.

# Contributing

Local development and testing information

## Tests

Run the tests:

```
yarn test
```

## Development

### Local node

Start a local hardhat node:

```
yarn hardhat node
```

### Testnet deploy

Prerequisites:

- testnet currency
- etherscan API key
- RPC node (e.g. infura or alchemy)
- coinmarketcap API key (optional, for estimating gas costs in USD)

Set the following environment variables:

```
MNEMONIC_RINKEBY=seed phrase....
ETH_NODE_URI_RINKEBY=https://eth-rinkeby.alchemyapi.io/v2/apikeyhere
# Can be anything
NFT_NAME_RINKEBY=TestToken
# Can be anything
NFT_SYMBOL_RINKEBY=TT
# Can be anything, but nice for it to return real metadata
METADATA_URI_RINKEBY=https://example.xyz/
# Set a prive or 0 for free (price is in wei)
MINT_PRICE_RINKEBY=0
```

Run:

```
yarn deploy
```

# POCs

## Signature mint

```
yarn hardhat mint --to 0xbcd4042de499d14e55001ccbb24a551f3b954096 --nonce 0 --network localhost
```

Advance the nonce to mint more to the same address

## Signatures accept

Demonstrates making a signature and verifying on the contract. See [here](test/test-signature.ts) for details
