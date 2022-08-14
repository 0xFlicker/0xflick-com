import { BigNumber, utils, Wallet } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { ens_gateway, ens_signer } from "../utils/network";

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  network,
  run,
}) => {
  const { deploy } = deployments;

  const ensSignerPrivateKey = ens_signer(network.name);
  const wallet = new Wallet(ensSignerPrivateKey);

  const publicSignerAddress = wallet.address;
  const { deployer } = await getNamedAccounts();

  const offChainResolverDeployment = await deploy("OffchainResolver", {
    from: deployer,
    args: [ens_gateway(network.name), [publicSignerAddress]],
    waitConfirmations: 5,
    log: true,
  });
  if (offChainResolverDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: offChainResolverDeployment.address,
      constructorArguments: [ens_gateway(network.name), [publicSignerAddress]],
    });
  }
};
export default func;
func.tags = ["test"];
