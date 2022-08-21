import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  FlickENS__factory,
  ExampleTokenUri__factory,
  ENSRegistry__factory,
  OffchainResolver__factory,
} from "../typechain";
import { ensResolver, userMint } from "./utils";
import { BigNumber, utils, providers } from "ethers";

const { Resolver } = providers;
function numPad(value: number): Uint8Array {
  const result = utils.arrayify(value);
  if (result.length > 32) {
    throw new Error("internal; should not happen");
  }

  const padded = new Uint8Array(32);
  padded.set(result, 32 - result.length);
  return padded;
}
function encodeBytes(datas: Array<utils.BytesLike>) {
  const result: Array<Uint8Array> = [];

  let byteCount = 0;

  // Add place-holders for pointers as we add items
  for (let i = 0; i < datas.length; i++) {
    result.push(null);
    byteCount += 32;
  }

  for (let i = 0; i < datas.length; i++) {
    const data = utils.arrayify(datas[i]);

    // Update the bytes offset
    result[i] = numPad(byteCount);

    // The length and padded value of data
    result.push(numPad(data.length));
    result.push(bytesPad(data));
    byteCount += 32 + Math.ceil(data.length / 32) * 32;
  }

  return utils.hexConcat(result);
}

function bytesPad(value: Uint8Array): Uint8Array {
  if (value.length % 32 === 0) {
    return value;
  }

  const result = new Uint8Array(Math.ceil(value.length / 32) * 32);
  result.set(value);
  return result;
}

function bytes32ify(value: number): string {
  return utils.hexZeroPad(BigNumber.from(value).toHexString(), 32);
}

describe("ENS test", function () {
  let accounts: SignerWithAddress[];
  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
  });

  it("forwards to offchain", async () => {
    const { provider } = waffle;
    const { mintContract, registry, offchainResolver, owner } =
      await ensResolver(accounts);
    const resolverAddress = await registry.resolver(
      utils.namehash("example.eth")
    );
    expect(resolverAddress).to.equal(offchainResolver.address);

    const data = utils.hexConcat([
      "0x3b3b57de",
      utils.namehash("example.eth"),
      "0x",
    ]);
    const tx = {
      to: resolverAddress,
      // selector("resolve(bytes,bytes)")
      data: utils.hexConcat([
        "0x9061b923",
        encodeBytes([utils.dnsEncode("example.eth"), data]),
      ]),
    };

    const result = await provider.call(tx);
    // More testing should be done... parse this result
    expect(result).to.equal(
      "0x556f18300000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa300000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000120f4d4d2f800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001468747470733a2f2f6578616d706c652e636f6d2f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000e49061b92300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000d076578616d706c6503657468000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000243b3b57de3d5d2e21162745e4df4f56471fd7f651f441adaaca25deb70e4738c6f63d1224000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e49061b92300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000d076578616d706c6503657468000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000243b3b57de3d5d2e21162745e4df4f56471fd7f651f441adaaca25deb70e4738c6f63d12240000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
  });
});
