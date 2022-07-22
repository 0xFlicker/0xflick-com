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
# Can be anything, but nice for it to return real metadata (see https://github.com/souls-of-akaso/lambdas)
METADATA_URI_RINKEBY=https://example.xyz/
# Set a prive or 0 for free (price is in wei)
MINT_PRICE_RINKEBY=0
```

Run:

```
yarn deploy
```

### Using the contracts locally in development

Inside this directory, run:

If using yarn:

```
yarn link
```

If using npm:

```
npm link
```

Go to the project you want to use these contracts and run:

Is using yarn

```
yarn link @souls-of-akaso/contracts
```

If using npm

```
npm link @souls-of-akaso/contracts
```

The contracts can now be imported into javascript:

```
import { SOA, SOA__factory } from "@souls-of-akaso/contracts";
import { Signer, providers } from "ethers";

export function factory(signerOrProvider: Signer | providers.Provider, address: string): SOA {
  return SOA__factory.connect(
    address,
    signerOrProvider
  );
}
```

# POCs

## Signature mint

```
yarn hardhat mint --to 0xbcd4042de499d14e55001ccbb24a551f3b954096 --nonce 0 --network localhost
```

Advance the nonce to mint more to the same address

## Signatures accept

Demonstrates making a signature and verifying on the contract. See [here](test/test-signature.ts) for details
