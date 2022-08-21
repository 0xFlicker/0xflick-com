import { ethers } from "hardhat";
import { bech32 } from "bech32";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ENSRegistry__factory,
  FlickENS__factory,
  OffchainResolver__factory,
} from "../typechain";
import { utils, providers } from "ethers";

export async function userMint(accounts: SignerWithAddress[]) {
  const [owner, signer, beneficiary, user] = accounts;
  const mintAmount = utils.parseEther("1");
  const mintFactory = new FlickENS__factory(owner);
  const mintContract = await mintFactory.deploy(
    "TestCoin",
    "TC",
    "http://example.com/",
    mintAmount,
    signer.address,
    [beneficiary.address],
    [1],
    beneficiary.address
  );
  await mintContract.setPresaleActive(true);
  const nonceBytes = ethers.utils.hexZeroPad(utils.hexlify(0), 32);
  const message = ethers.utils.solidityPack(
    ["address", "bytes32"],
    [user.address, nonceBytes]
  );
  const signature = await signer.signMessage(
    // Needs to be cast to binary data, otherwise will be signed as a string
    utils.arrayify(
      // This call is the same a utils.keccak256(utils.solidityPack(...))
      message
    )
  );
  const userMintContract = FlickENS__factory.connect(
    mintContract.address,
    user
  );
  // Call mint function with the same values as the signature and the signature
  await userMintContract.presaleMint(user.address, nonceBytes, 1, signature, {
    value: mintAmount,
  });
  return {
    mintContract,
    mintAmount,
    owner,
    user,
  };
}

export async function ensResolver(accounts: SignerWithAddress[]) {
  const [deployer, signer] = accounts;
  // Signer for Offchain resolver

  const { mintContract } = await userMint(accounts);
  const ensRegistryFactory = new ENSRegistry__factory(deployer);
  const registry = await ensRegistryFactory.deploy();
  const OffchainResolverFactory = new OffchainResolver__factory(deployer);
  const offchainResolver = await OffchainResolverFactory.deploy(
    mintContract.address,
    "https://example.com/",
    [signer.address]
  );

  await mintContract.setOffchainResolver(offchainResolver.address);
  await registry.setSubnodeOwner(
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    utils.id("eth"),
    deployer.address
  );
  await registry.setSubnodeOwner(
    utils.namehash("eth"),
    utils.id("example"),
    deployer.address,
    {
      gasLimit: 1000000,
    }
  );
  await registry.setResolver(
    utils.namehash("example.eth"),
    offchainResolver.address
  );

  return {
    mintContract,
    registry,
    offchainResolver,
    owner: deployer,
    signer,
  };
}

const coinInfos: Record<
  string,
  {
    symbol: string;
    p2pkh?: number;
    p2sh?: number;
    prefix?: string;
    ilk?: string;
  }
> = {
  "0": { symbol: "btc", p2pkh: 0x00, p2sh: 0x05, prefix: "bc" },
  "2": { symbol: "ltc", p2pkh: 0x30, p2sh: 0x32, prefix: "ltc" },
  "3": { symbol: "doge", p2pkh: 0x1e, p2sh: 0x16 },
  "60": { symbol: "eth", ilk: "eth" },
  "61": { symbol: "etc", ilk: "eth" },
  "700": { symbol: "xdai", ilk: "eth" },
};

export function getCoinAddress(coinType: number, hexBytes: string) {
  const coinInfo = coinInfos[String(coinType)];
  const bytes = utils.arrayify(hexBytes);
  const length = bytes[1];

  // https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#witness-program
  let version = bytes[0];
  if (version === 0x00) {
    if (length !== 20 && length !== 32) {
      version = -1;
    }
  } else {
    version = -1;
  }

  if (
    version >= 0 &&
    bytes.length === 2 + length &&
    length >= 1 &&
    length <= 75
  ) {
    const words = bech32.toWords(bytes.slice(2));
    words.unshift(version);
    return bech32.encode(coinInfo.prefix, words);
  }
}
