import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FlickENS__factory, VRFCoordinatorV2Mock__factory } from "../typechain";
import { utils } from "ethers";

describe("Minting test", function () {
  let accounts: SignerWithAddress[];
  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
  });

  it("presale must be active", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );
    // Call mint function with the same values as the signature and the signature
    await expect(
      mintContract.presaleMint(
        user.address,
        ethers.utils.hexZeroPad(utils.hexlify(0), 32),
        4,
        await signer.signMessage(
          utils.arrayify(
            ethers.utils.solidityPack(
              ["address", "bytes32"],
              [user.address, ethers.utils.hexZeroPad(utils.hexlify(0), 32)]
            )
          )
        ),
        {
          value: utils.parseEther("4"),
        }
      )
    ).revertedWith("disabled");
  });

  it("can presale mint", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
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

    // Call mint function with the same values as the signature and the signature
    await mintContract.presaleMint(user.address, nonceBytes, 1, signature);

    // Check that the balance is correct
    expect(await mintContract.balanceOf(user.address)).to.eq(1);
  });

  it("presale single mint gas cost", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );
    await mintContract.setPresaleActive(true);
    // Call mint function with the same values as the signature and the signature
    const transaction1 = await mintContract.presaleMint(
      user.address,
      ethers.utils.hexZeroPad(utils.hexlify(0), 32),
      1,
      await signer.signMessage(
        utils.arrayify(
          ethers.utils.solidityPack(
            ["address", "bytes32"],
            [user.address, ethers.utils.hexZeroPad(utils.hexlify(0), 32)]
          )
        )
      )
    );
    const receipt1 = await transaction1.wait();
    expect(receipt1.gasUsed).to.be.lt(200_000);
  });

  it("presale multiple mint gas cost", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );
    await mintContract.setPresaleActive(true);
    // Call mint function with the same values as the signature and the signature
    const transaction1 = await mintContract.presaleMint(
      user.address,
      ethers.utils.hexZeroPad(utils.hexlify(0), 32),
      4,
      await signer.signMessage(
        utils.arrayify(
          ethers.utils.solidityPack(
            ["address", "bytes32"],
            [user.address, ethers.utils.hexZeroPad(utils.hexlify(0), 32)]
          )
        )
      ),
      {
        value: utils.parseEther("4"),
      }
    );
    const receipt1 = await transaction1.wait();
    expect(receipt1.gasUsed).to.be.lt(220_000);
  });

  it("cant presale mint more than allowed", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
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

    // way too much
    await expect(
      mintContract.presaleMint(user.address, nonceBytes, 20, signature, {
        value: utils.parseEther("20"),
      })
    ).revertedWith("mint >= maxmint");
    // no mints should have happened
    expect(await mintContract.balanceOf(user.address)).to.eq(0);

    // good mint
    await mintContract.presaleMint(user.address, nonceBytes, 2, signature, {
      value: utils.parseEther("2"),
    });
    expect(await mintContract.balanceOf(user.address)).to.eq(2);

    // good mint
    await mintContract.presaleMint(
      user.address,
      ethers.utils.hexZeroPad(utils.hexlify(1), 32),
      8,
      await signer.signMessage(
        utils.arrayify(
          ethers.utils.solidityPack(
            ["address", "bytes32"],
            [user.address, ethers.utils.hexZeroPad(utils.hexlify(1), 32)]
          )
        )
      ),
      {
        value: utils.parseEther("8"),
      }
    );
    expect(await mintContract.balanceOf(user.address)).to.eq(10);

    // bad mint
    await expect(
      mintContract.presaleMint(
        user.address,
        ethers.utils.hexZeroPad(utils.hexlify(2), 32),
        2,
        await signer.signMessage(
          utils.arrayify(
            ethers.utils.solidityPack(
              ["address", "bytes32"],
              [user.address, ethers.utils.hexZeroPad(utils.hexlify(2), 32)]
            )
          )
        ),
        {
          value: utils.parseEther("2"),
        }
      ),
      "user has minted too many"
    ).revertedWith("too many mints");
    expect(await mintContract.balanceOf(user.address)).to.eq(10);
  });

  it("mint must be active", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );
    // Call mint function with the same values as the signature and the signature
    await expect(mintContract.mint(user.address, 1)).revertedWith("disabled");

    // presale being active not good enough
    await mintContract.setPresaleActive(true);
    await expect(mintContract.mint(user.address, 1)).revertedWith("disabled");
  });

  it("can mint", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );
    await mintContract.setMintActive(true);

    // Call mint function with the same values as the signature and the signature
    await mintContract.mint(user.address, 1);

    // Check that the balance is correct
    expect(await mintContract.balanceOf(user.address)).to.eq(1);
  });

  it("gas costs for single mint", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );
    await mintContract.setMintActive(true);

    // Call mint function with the same values as the signature and the signature
    const transaction = await mintContract.mint(user.address, 1);

    const receipt = await transaction.wait();
    expect(receipt.gasUsed).to.be.lt(140_000);
  });

  it("gas costs for multiple mint", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );
    await mintContract.setMintActive(true);

    // Call mint function with the same values as the signature and the signature
    const transaction = await mintContract.mint(user.address, 4, {
      value: utils.parseEther("4"),
    });

    const receipt = await transaction.wait();
    expect(receipt.gasUsed).to.be.lt(160_000);
  });

  it("can gift", async () => {
    const [owner, signer, beneficiary, user] = accounts;
    const mintFactory = new FlickENS__factory(owner);
    const mockCoordinator = await new VRFCoordinatorV2Mock__factory(
      owner
    ).deploy(0, 0);
    const mintContract = await mintFactory.deploy(
      "TestCoin",
      "TC",
      "foo",
      signer.address,
      [beneficiary.address],
      [1],
      beneficiary.address,
      mockCoordinator.address
    );

    await mintContract.gift([1], [user.address]);
    expect(await mintContract.balanceOf(user.address)).to.eq(1);
  });
});
