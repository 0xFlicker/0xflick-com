import { constants, utils, Wallet } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { ens_contract, ens_gateway, ens_signer } from "../utils/network";

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  network,
  run,
  ethers,
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying ENS Reflection Resolver");

  const reflectionResolverDeployment = await deploy(
    "NameflickENSReflectionResolver",
    {
      from: deployer,
      args: [],
      waitConfirmations: 5,
      log: true,
    }
  );

  try {
    await run("verify:verify", {
      address: reflectionResolverDeployment.address,
      constructorArguments: reflectionResolverDeployment.args,
    });
  } catch (e) {
    console.error(e);
  }
};
export default func;
func.tags = ["reflection_resolver_only"];
