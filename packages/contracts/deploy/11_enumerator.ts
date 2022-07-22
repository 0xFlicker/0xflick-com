import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { contractStat } from "../utils/deployer";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, run, ethers } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  if (network.name !== "mainnet") {
    return;
  }
  let { isDeployed, contractAddress } = await contractStat(
    deployments,
    "Enumerator",
    deployer,
    []
  );
  if (isDeployed) {
    console.log(`Enumerator is deployed at ${contractAddress}`);
  } else {
    console.log(`Deploying to ${network.name} with ${deployer}`);

    const enumerator = await deploy("Enumerator", {
      from: deployer,
      args: [],
      waitConfirmations: 5
    });
    contractAddress = enumerator.address;
  }

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/Enumerator.sol:Enumerator",
    });
  } catch (err: any) {
    console.log(`Failed to verify: ${err.message}`);
  }
};
export default func;
func.tags = ["Enumerator"];
