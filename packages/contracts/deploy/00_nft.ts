import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { FlickENS__factory } from "../typechain";
import {
  nft_name,
  nft_symbol,
  metadata_url,
  nft_mint_price,
} from "../utils/network";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, run, ethers } = hre;
  const { deploy } = deployments;

  const { deployer, signer, beneficiary } = await getNamedAccounts();

  const args = [
    nft_name(network.name),
    nft_symbol(network.name),
    metadata_url(network.name),
    signer,
    [beneficiary],
    [1],
    beneficiary,
    "0x0000000000000000000000000000000000000000",
  ];

  const deployed = await deploy("FlickENS", {
    from: deployer,
    args,
    waitConfirmations: 5,
    log: true,
  });
  const ownerSigner = await ethers.getSigner(deployer);
  const contract = FlickENS__factory.connect(deployed.address, ownerSigner);
  if (!(await contract.isSigner(signer))) {
    await contract.addSigner(signer);
  }
  if (deployed.newlyDeployed) {
    await run("verify:verify", {
      address: deployed.address,
      constructorArguments: args,
    });
  }
};
export default func;
func.tags = ["test", "production"];
