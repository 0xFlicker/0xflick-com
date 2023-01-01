import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { userMint } from "./utils";
import { BigNumber, utils, providers, constants } from "ethers";
import {
  NameflickENSResolver__factory,
  AddrResolver__factory,
  TextResolver__factory,
} from "../typechain";

const formatter = new providers.Formatter();
const resolverAddrInterface = AddrResolver__factory.createInterface();
const resolverTextInterface = TextResolver__factory.createInterface();
const resolverServiceInterface =
  NameflickENSResolver__factory.createInterface();

function parseBytes(result: string, start: number): null | string {
  if (result === "0x") {
    return null;
  }

  const offset = BigNumber.from(
    utils.hexDataSlice(result, start, start + 32)
  ).toNumber();
  const length = BigNumber.from(
    utils.hexDataSlice(result, offset, offset + 32)
  ).toNumber();

  return utils.hexDataSlice(result, offset + 32, offset + 32 + length);
}

async function resolveResolver(
  registryAddress: string,
  name: string,
  provider: providers.Provider
) {
  // keccak256("resolver(bytes32)")
  const data = "0x0178b8bf" + utils.namehash(name).substring(2);
  const transaction = { to: registryAddress, data: data };
  const result = await provider.call(transaction);
  return formatter.callAddress(result);
}

// Resolves a name, as specified by ENSIP 10
async function resolveAddress(
  resolverAddress: string,
  domain: string,
  provider: providers.Provider
) {
  // First generate the calldata data for the call
  // keccak256("addr(bytes32)")
  const resolveData = resolverAddrInterface.encodeFunctionData(
    "addr(bytes32)",
    [utils.namehash(domain)]
  );
  // Now generate the call transaction
  const data = resolverServiceInterface.encodeFunctionData("resolve", [
    utils.dnsEncode(domain),
    resolveData,
  ]);
  const transaction = { to: resolverAddress, data: data };
  const response = await provider.call(transaction);
  const result = resolverServiceInterface.decodeFunctionResult(
    "resolve",
    response
  );
  return result[0];
}

async function resolveCoinAddress(
  resolverAddress: string,
  domain: string,
  coinId: BigNumber,
  provider: providers.Provider
) {
  // First generate the calldata data for the call
  // keccak256("addr(bytes32)")
  const resolveData = resolverAddrInterface.encodeFunctionData(
    "addr(bytes32,uint256)",
    [utils.namehash(domain), coinId]
  );
  // Now generate the call transaction
  const data = resolverServiceInterface.encodeFunctionData("resolve", [
    utils.dnsEncode(domain),
    resolveData,
  ]);
  const transaction = { to: resolverAddress, data: data };
  const response = await provider.call(transaction);
  const result = resolverServiceInterface.decodeFunctionResult(
    "resolve",
    response
  );
  return result[0];
}

async function resolveText(
  resolverAddress: string,
  domain: string,
  textRecord: string,
  provider: providers.Provider
) {
  // First generate the calldata data for the call
  // keccak256("text(bytes32,string)")
  const resolveData = resolverTextInterface.encodeFunctionData("text", [
    utils.namehash(domain),
    textRecord,
  ]);
  // Now generate the call transaction
  const data = resolverServiceInterface.encodeFunctionData("resolve", [
    utils.dnsEncode(domain),
    resolveData,
  ]);
  const transaction = { to: resolverAddress, data: data };
  const response = await provider.call(transaction);
  return utils.toUtf8String(parseBytes(response, 0));
}

describe("Registry", function () {
  let accounts: SignerWithAddress[];
  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
  });

  it("Can register NFT", async () => {
    const { mintContract, owner, mockCoordinator, subscriptionId } =
      await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      mintContract.address,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await nameflickResolver.registerContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [60]
    );

    expect(
      await nameflickResolver.nfts(utils.namehash("example.eth"))
    ).to.equal(mintContract.address);
  });

  it("Must own the NFT", async () => {
    const user = accounts[1];
    const { mintContract, owner, mockCoordinator, subscriptionId } =
      await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example2"),
      user.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      mintContract.address,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    const userNameFlickResolver = nameflickResolver.connect(user);

    await nameflickResolver.setRequireContractOwnershipToRegister(true);
    await expect(
      userNameFlickResolver.registerContract(
        utils.namehash("example2.eth"),
        mintContract.address,
        [60]
      )
    ).to.revertedWith("Caller not owner of contract");
    await nameflickResolver.setRequireContractOwnershipToRegister(false);
    await userNameFlickResolver.registerContract(
      utils.namehash("example2.eth"),
      mintContract.address,
      [60]
    );

    expect(
      await nameflickResolver.nfts(utils.namehash("example2.eth"))
    ).to.equal(mintContract.address);
  });

  it("Must own the ENS", async () => {
    const user = accounts[1];
    const { mintContract, owner, mockCoordinator, subscriptionId } =
      await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example2"),
      user.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      mintContract.address,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    const userNameFlickResolver = nameflickResolver.connect(user);

    await expect(
      nameflickResolver.registerContract(
        utils.namehash("example2.eth"),
        mintContract.address,
        [60]
      )
    ).to.revertedWith("Caller does not own ENS node");
  });
  it("Can resolve NFT ETH subdomain", async () => {
    const { mintContract, owner, user, mockCoordinator, subscriptionId } =
      await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      mintContract.address,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await nameflickResolver.registerContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [60]
    );

    await mintContract.setOffchainResolver(nameflickResolver.address);
    await registry.setResolver(
      utils.namehash("example.eth"),
      mintContract.address
    );

    // mint one token
    await mintContract.setMintActive(true);
    await mintContract.mint(owner.address, 1);

    const resolverAddress = await resolveResolver(
      registry.address,
      "example.eth",
      owner.provider
    );
    expect(resolverAddress).to.equal(mintContract.address);
    expect(
      await resolveAddress(resolverAddress, "1.example.eth", owner.provider)
    ).to.hexEqual(user.address);
    expect(
      await resolveAddress(resolverAddress, "2.example.eth", owner.provider)
    ).to.hexEqual(owner.address);
    await expect(
      resolveAddress(resolverAddress, "3.example.eth", owner.provider)
    ).to.reverted;
  });

  it("Can resolve NFT avatars for subdomain", async () => {
    const { mintContract, owner, user, mockCoordinator, subscriptionId } =
      await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      mintContract.address,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await nameflickResolver.registerContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [60]
    );

    await mintContract.setOffchainResolver(nameflickResolver.address);
    await registry.setResolver(
      utils.namehash("example.eth"),
      mintContract.address
    );

    // mint one token
    await mintContract.setMintActive(true);
    await mintContract.mint(owner.address, 1);

    const resolverAddress = await resolveResolver(
      registry.address,
      "example.eth",
      owner.provider
    );
    expect(resolverAddress).to.equal(mintContract.address);
    expect(
      await resolveText(
        resolverAddress,
        "1.example.eth",
        "avatar",
        owner.provider
      )
    ).to.equal(`eip155:1/erc721:${mintContract.address.toLowerCase()}/1`);
    expect(
      await resolveText(
        resolverAddress,
        "2.example.eth",
        "avatar",
        owner.provider
      )
    ).to.equal(`eip155:1/erc721:${mintContract.address.toLowerCase()}/2`);
    await expect(
      resolveText(resolverAddress, "2.example.eth", "email", owner.provider)
    ).to.reverted;
    await expect(
      resolveText(resolverAddress, "3.example.eth", "avatar", owner.provider)
    ).to.reverted;
  });

  it("Can support other coin types", async () => {
    const { mintContract, owner, user, mockCoordinator, subscriptionId } =
      await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      mintContract.address,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await nameflickResolver.registerContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [60, 96]
    );

    await mintContract.setOffchainResolver(nameflickResolver.address);
    await registry.setResolver(
      utils.namehash("example.eth"),
      mintContract.address
    );

    const resolverAddress = await resolveResolver(
      registry.address,
      "example.eth",
      owner.provider
    );
    expect(
      await resolveCoinAddress(
        resolverAddress,
        "1.example.eth",
        BigNumber.from(60),
        owner.provider
      )
    ).to.hexEqual(user.address);
    expect(
      await resolveCoinAddress(
        resolverAddress,
        "1.example.eth",
        BigNumber.from(96),
        owner.provider
      )
    ).to.hexEqual(user.address);
    await expect(
      resolveCoinAddress(
        resolverAddress,
        "1.example.eth",
        BigNumber.from(55),
        owner.provider
      )
    ).to.be.reverted;
  });

  it("Can stand alone", async () => {
    const { mintContract, owner, user } = await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      constants.AddressZero,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await nameflickResolver.registerContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [60]
    );

    await registry.setResolver(
      utils.namehash("example.eth"),
      nameflickResolver.address
    );

    const resolverAddress = await resolveResolver(
      registry.address,
      "example.eth",
      owner.provider
    );
    expect(resolverAddress).to.equal(nameflickResolver.address);

    expect(
      await resolveCoinAddress(
        resolverAddress,
        "1.example.eth",
        BigNumber.from(60),
        owner.provider
      )
    ).to.hexEqual(user.address);
  });

  it("can remove contract from resolver", async () => {
    const { mintContract, owner, user } = await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      constants.AddressZero,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await nameflickResolver.registerContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [60]
    );

    await nameflickResolver.disableContract(utils.namehash("example.eth"));

    await registry.setResolver(
      utils.namehash("example.eth"),
      nameflickResolver.address
    );

    const resolverAddress = await resolveResolver(
      registry.address,
      "example.eth",
      owner.provider
    );

    await expect(
      resolveCoinAddress(
        resolverAddress,
        "1.example.eth",
        BigNumber.from(60),
        owner.provider
      )
    ).to.be.reverted;
  });

  it("can remove coin from resolver", async () => {
    const { mintContract, owner, user } = await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      constants.AddressZero,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await nameflickResolver.registerContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [60, 100]
    );

    await nameflickResolver.disableCoinForContract(
      utils.namehash("example.eth"),
      mintContract.address,
      [100]
    );

    await registry.setResolver(
      utils.namehash("example.eth"),
      nameflickResolver.address
    );

    const resolverAddress = await resolveResolver(
      registry.address,
      "example.eth",
      owner.provider
    );

    await expect(
      resolveCoinAddress(
        resolverAddress,
        "1.example.eth",
        BigNumber.from(100),
        owner.provider
      )
    ).to.be.reverted;
  });

  it("emits logs", async () => {
    const { mintContract, owner, user } = await userMint(accounts);

    // deploy an ENS registry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry", owner);
    const registry = await ENSRegistry.deploy();
    await registry.deployed();

    // deploy root ETH node
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      owner.address
    );

    // deploy example.eth node
    await registry.setSubnodeOwner(
      utils.namehash("eth"),
      utils.id("example"),
      owner.address
    );

    // deploy NameFlickENSResolver
    const NameFlickENSResolver = await ethers.getContractFactory(
      "NameflickENSResolver",
      owner
    );
    const nameflickResolver = await NameFlickENSResolver.deploy(
      registry.address,
      constants.AddressZero,
      ["https://example.com/"],
      [owner.address]
    );

    // register NFT contract on ENS
    await expect(
      nameflickResolver.registerContract(
        utils.namehash("example.eth"),
        mintContract.address,
        [60, 100]
      )
    )
      .to.emit(nameflickResolver, "EnableContractResolution")
      .and.to.emit(nameflickResolver, "RegisterContractCoin");

    await expect(
      nameflickResolver.disableCoinForContract(
        utils.namehash("example.eth"),
        mintContract.address,
        [100, 60]
      )
    ).to.emit(nameflickResolver, "UnregisterContractCoin");
    await expect(
      nameflickResolver.disableContract(utils.namehash("example.eth"))
    ).to.emit(nameflickResolver, "DisableContractResolution");
  });
});
