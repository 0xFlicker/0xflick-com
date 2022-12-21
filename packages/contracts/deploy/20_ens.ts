import { utils } from "ethers";
import { getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
  deployments,
  getUnnamedAccounts,
  run,
  network,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const ensDeployment = await deploy("ENSRegistry", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  const reverseRegistryDeployment = await deploy("ReverseRegistrar", {
    from: deployer,
    args: [ensDeployment.address],
    log: true,
    waitConfirmations: 5,
  });

  if (reverseRegistryDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: reverseRegistryDeployment.address,
      constructorArguments: reverseRegistryDeployment.args,
    });
  }
  const publicResolverDeployment = await deploy("PublicResolver", {
    from: deployer,
    args: [
      ensDeployment.address,
      "0x0000000000000000000000000000000000000000",
      deployer,
      reverseRegistryDeployment.address,
    ],
    log: true,
    waitConfirmations: 5,
  });
  if (publicResolverDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: publicResolverDeployment.address,
      constructorArguments: publicResolverDeployment.args,
    });
  }

  const baseRegistrarDeployment = await deploy("BaseRegistrarImplementation", {
    from: deployer,
    args: [ensDeployment.address, utils.namehash("eth")],
    log: true,
    waitConfirmations: 5,
  });
  if (baseRegistrarDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: baseRegistrarDeployment.address,
      constructorArguments: baseRegistrarDeployment.args,
    });
  }
};
export default func;
func.tags = ["test"];
