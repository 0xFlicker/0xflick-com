import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  OffchainResolver__factory,
  IResolverService__factory,
  PublicResolver__factory,
} from "../typechain";
import { ensResolver } from "./utils";
import { BigNumber, utils } from "ethers";
import { hexDataLength, hexDataSlice } from "@ethersproject/bytes";
import { decodeDnsName } from "@0xflick/models";

const resolveInterface = IResolverService__factory.createInterface();
const resolveFn = resolveInterface.getFunction("resolve");
const resolveSigHash = resolveInterface.getSighash("resolve");
const pubResolverInterface = PublicResolver__factory.createInterface();
const addrFn = pubResolverInterface.getFunction("addr(bytes32)");
const addrSigHash = pubResolverInterface.getSighash(addrFn.format("sighash"));

function _parseString(result: string, start: number): null | string {
  try {
    return utils.toUtf8String(_parseBytes(result, start));
  } catch (error) {}
  return null;
}

function _parseBytes(result: string, start: number): null | string {
  if (result === "0x") {
    return null;
  }

  const offset = BigNumber.from(
    hexDataSlice(result, start, start + 32)
  ).toNumber();
  const length = BigNumber.from(
    hexDataSlice(result, offset, offset + 32)
  ).toNumber();

  return hexDataSlice(result, offset + 32, offset + 32 + length);
}

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
    const { mintContract, registry, nameflickResolver, owner } =
      await ensResolver(accounts);
    const resolverAddress = await registry.resolver(
      utils.namehash("example.eth")
    );
    expect(resolverAddress).to.equal(mintContract.address);

    const tx = {
      to: mintContract.address,
      // selector("resolve(bytes,bytes)")
      data: utils.hexConcat([
        resolveSigHash, // "0x9061b923"
        encodeBytes([
          utils.dnsEncode("example.eth"),
          utils.hexConcat([addrSigHash, utils.namehash("example.eth"), "0x"]),
        ]),
      ]),
    };

    const result = await provider.call(tx);
    const offchainInterface = OffchainResolver__factory.createInterface();
    expect(result.substring(0, 10)).to.equal(
      offchainInterface.getSighash(
        offchainInterface.getError("OffchainLookup").format("sighash")
      )
    );
    expect(hexDataLength(result) % 32).to.equal(4);
    const data = hexDataSlice(result, 4);
    const sender = hexDataSlice(data, 0, 32);
    expect(BigNumber.from(sender).eq(mintContract.address)).to.be.true;
    const urls: Array<string> = [];
    const urlsOffset = BigNumber.from(hexDataSlice(data, 32, 64)).toNumber();
    const urlsLength = BigNumber.from(
      hexDataSlice(data, urlsOffset, urlsOffset + 32)
    ).toNumber();
    const urlsData = hexDataSlice(data, urlsOffset + 32);
    for (let u = 0; u < urlsLength; u++) {
      const url = _parseString(urlsData, u * 32);
      expect(url).to.be.not.null;
      urls.push(url);
    }
    expect(urls).to.deep.equal(["https://example.com/"]);

    const calldata = _parseBytes(data, 64);
    const callbackSelector = hexDataSlice(data, 96, 100);
    const extraData = _parseBytes(data, 128);
    const resolvWithProofSigHash = mintContract.interface.getSighash(
      "resolveWithProof(bytes,bytes)"
    );

    const offchainSelector = calldata.slice(0, 10).toLowerCase();
    const [offchainEncodedName, offchainData] = utils.defaultAbiCoder.decode(
      resolveFn.inputs,
      "0x" + calldata.slice(10)
    );
    expect(callbackSelector).to.equal(resolvWithProofSigHash);
    expect(offchainSelector).to.equal(resolveSigHash);
    expect(
      decodeDnsName(Buffer.from(offchainEncodedName.slice(2), "hex"))
    ).to.equal("example.eth");
  });
});
