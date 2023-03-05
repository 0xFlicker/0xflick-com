import { constants, utils, Wallet } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { NameflickENSResolver__factory } from "../typechain";
import { ens_contract, ens_gateway, ens_signer } from "../utils/network";

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  network,
  run,
  ethers,
}) => {
  const { deploy } = deployments;

  const ensSignerPrivateKey = ens_signer(network.name);
  const wallet = new Wallet(ensSignerPrivateKey);

  const publicSignerAddress = wallet.address;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  console.log("Deploying ENS Resolver");

  const offChainResolverDeployment = await deploy("NameflickENSResolver", {
    from: deployer,
    args: [
      ens_contract(network.name) ?? constants.AddressZero,
      constants.AddressZero,
      [ens_gateway(network.name)],
      [publicSignerAddress],
    ],
    waitConfirmations: 5,
    log: true,
  });

  try {
    await run("verify:verify", {
      address: offChainResolverDeployment.address,
      constructorArguments: offChainResolverDeployment.args,
    });
  } catch (e) {
    console.error(e);
  }
};
export default func;
func.tags = ["offchain_resolver_only"];
