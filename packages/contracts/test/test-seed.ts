import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { userMint } from "./utils";
import { BigNumber } from "ethers";

describe("Seed", function () {
  let accounts: SignerWithAddress[];
  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
  });

  it("Can request randomness", async () => {
    const { mintContract, owner, mockCoordinator, subscriptionId } =
      await userMint(accounts);

    await expect(mintContract.dna(1)).revertedWith("NotRevealed");
    await mintContract.requestRandomWords();
    await mockCoordinator.fulfillRandomWords(
      subscriptionId,
      mintContract.address
    );
    expect(await mintContract.dna(1)).to.equal(
      BigNumber.from(
        "103011630018547202021349936898198407051047185444285926202664516530049822046697"
      )
    );
  });
});
