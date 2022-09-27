# Contracts

## Summary

### NameflickENS

ERC721 NFT that is the entrypoint in the Nameflick ecosystem

### NameflickResolver

Implements a combinations off and on chain resolver. Resolutions will first be looked up on chain, and if not found, will revert with an OffchainLookup error that signals compatible clients to look offchain.

## Scenarios

#### Wrap an NFT

User owns a NameflickENS that is capable of wrapping an NFT to allow holders of the NFT to resolve {tokenId}.{ensName}.eth

Prerequisites:

- User owns a NameflickENS w/ "wrap collection" with tokenId 42
- User owns an ENS at node: 0x11223344 with name: example.eth
- User wants to wrap an NFT at 0x123beef
- User owns token 1 of the NFT collection at 0x123beef

##### Create

sighash: `"bindENS(uint196, bytes32, uint64)"`

```
NameflickNFT.bindENS(32, 0x11223344, 0xFFFFFFFF)
```

sighash: `"bindERC721(uint196, address, uint64)`

```
NameflickNFT.bindERC721(42, 0x123beef, 0xFFFFFFFF)
```

Now resolve the token:

```js
NameflickNFT.resolve(
  sigHash("resolve(bytes,bytes)"),
  abiEncode(sigHash("addr(bytes32)"), [encodeDnsName("1.example.eth")])
);
```

##### Write to chain

nameflickResolver.save(name, )
