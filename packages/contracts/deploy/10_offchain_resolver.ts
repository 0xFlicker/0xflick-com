import { Wallet } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { FlickENS__factory } from "../typechain";
import { ens_gateway, ens_signer } from "../utils/network";

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
  const flickDeployment = await deployments.get("FlickENS");
  const flickContract = FlickENS__factory.connect(
    flickDeployment.address,
    signer
  );

  const ensDeployment = await deploy("ENSRegistry", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  });
  if (ensDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: ensDeployment.address,
      constructorArguments: [],
    });
  }

  const offChainResolverDeployment = await deploy("NameflickENSResolver", {
    from: deployer,
    args: [
      ensDeployment.address,
      flickDeployment.address,
      [ens_gateway(network.name)],
      [publicSignerAddress],
    ],
    waitConfirmations: 5,
    log: true,
  });

  if (offChainResolverDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: offChainResolverDeployment.address,
      constructorArguments: offChainResolverDeployment.args,
    });
  }
  if (
    (await flickContract.resolverProxy()) !== offChainResolverDeployment.address
  ) {
    const tx = await flickContract.setOffchainResolver(
      offChainResolverDeployment.address
    );
    await tx.wait();
  }
};
export default func;
func.tags = ["test", "production"];
