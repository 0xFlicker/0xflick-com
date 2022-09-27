import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FlickENS__factory, ExampleTokenUri__factory } from "../typechain";
import { userMint } from "./utils";

describe("Metadata test", function () {
  let accounts: SignerWithAddress[];
  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
  });

  it("can update baseUri", async () => {
    const { mintContract, user } = await userMint(accounts);
    expect(await mintContract.tokenURI(1)).to.equal("http://example.com/1");
    await mintContract.setBaseTokenURI("http://example.com/updated/");
    // Check if owner can set
    expect(await mintContract.tokenURI(1)).to.equal(
      "http://example.com/updated/1"
    );
    // Check that user cannot set
    const userMintContract = FlickENS__factory.connect(
      mintContract.address,
      user
    );
    await expect(
      userMintContract.setBaseTokenURI("http://example.com/updated/")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("can use a renderer contract", async () => {
    const { mintContract, user, owner } = await userMint(accounts);
    const rendererFactory = new ExampleTokenUri__factory(owner);
    const rendererContract = await rendererFactory.deploy();
    await mintContract.setRenderingContract(rendererContract.address);
    expect(await mintContract.tokenURI(1)).to.equal(
      "https://example.com/token/1"
    );
  });

  it("only the owner can set the renderer contract", async () => {
    const { mintContract, user } = await userMint(accounts);
    const rendererFactory = new ExampleTokenUri__factory(user);
    const rendererContract = await rendererFactory.deploy();
    const userMintContract = FlickENS__factory.connect(
      mintContract.address,
      user
    );
    await expect(
      userMintContract.setRenderingContract(rendererContract.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
