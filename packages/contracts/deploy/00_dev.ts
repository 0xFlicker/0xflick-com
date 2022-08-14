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

  console.log(`Deploying to ${network.name} with ${deployer}`);
  const args = [
    nft_name(network.name),
    nft_symbol(network.name),
    metadata_url(network.name),
    nft_mint_price(network.name),
    signer,
    [beneficiary],
    [1],
    beneficiary,
  ];

  console.log(`Deploying NFT with arguments: ${JSON.stringify(args)}`);

  const deployed = await deploy("FlickENS", {
    from: deployer,
    args,
    log: true,
  });
  const ownerSigner = await ethers.getSigner(deployer);
  const contract = FlickENS__factory.connect(deployed.address, ownerSigner);
  if (!(await contract.isSigner(signer))) {
    await contract.addSigner(signer);
  }
};
export default func;
func.tags = ["test"];
