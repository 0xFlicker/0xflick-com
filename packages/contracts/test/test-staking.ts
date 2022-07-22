import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { NFT, NFT__factory } from "../typechain";
import { BigNumber, utils } from "ethers";

async function mint(contract: NFT, user: SignerWithAddress, count: number) {
  if (!(await contract.publicSaleActive())) {
    await contract.setMintActive(true);
  }
  return await contract.connect(user).mint(user.address, count, {
    value: utils.parseEther(count.toString()),
  });
}

async function deployNft(accounts: SignerWithAddress[]) {
  const [owner, signer, beneficiary] = accounts;
  const mintAmount = utils.parseEther("1");
  const mintFactory = new NFT__factory(owner);
  const mintContract = await mintFactory.deploy(
    "TestCoin",
    "TC",
    "foo",
    mintAmount,
    signer.address,
    [beneficiary.address],
    [1],
    beneficiary.address
  );
  return mintContract;
}

describe("staking", function () {
  let accounts: SignerWithAddress[];
  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
  });

  it("can seek", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    let nft = await deployNft(accounts);
    await mint(nft, user, 1);
    await nft.setStakingOpen(true);
    nft = nft.connect(user);
    await nft.toggleStaking([0]);
    expect(await nft.stakingPeriod(0)).to.deep.equal([
      true,
      BigNumber.from(0),
      BigNumber.from(0),
    ]);
  });

  it("can seek x10", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    let nft = await deployNft(accounts);
    await mint(nft, user, 10);
    await nft.setStakingOpen(true);
    nft = nft.connect(user);
    const staking = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    await nft.toggleStaking(staking);
    for (const s of staking) {
      expect(await nft.stakingPeriod(s)).to.deep.equal([
        true,
        BigNumber.from(0),
        BigNumber.from(0),
      ]);
    }
  });
});
