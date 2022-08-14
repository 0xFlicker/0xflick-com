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
  const baseRegistrarDeployment = await deploy("BaseRegistrarImplementation", {
    from: deployer,
    args: [ensDeployment.address, utils.namehash("eth")],
    log: true,
    waitConfirmations: 5,
  });
  if (ensDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: ensDeployment.address,
      constructorArguments: [],
    });
  }
  if (baseRegistrarDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: baseRegistrarDeployment.address,
      constructorArguments: [ensDeployment.address, utils.id("eth")],
    });
  }
};
export default func;
func.tags = ["test"];
