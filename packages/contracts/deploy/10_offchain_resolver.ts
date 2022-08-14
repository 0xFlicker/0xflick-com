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

  const offChainResolverDeployment = await deploy("OffchainResolver", {
    from: deployer,
    args: [
      flickDeployment.address,
      ens_gateway(network.name),
      [publicSignerAddress],
    ],
    waitConfirmations: 5,
    log: true,
  });
  if (offChainResolverDeployment.newlyDeployed) {
    await run("verify:verify", {
      address: offChainResolverDeployment.address,
      constructorArguments: [
        flickDeployment.address,
        ens_gateway(network.name),
        [publicSignerAddress],
      ],
    });
  }
  if (
    (await flickContract.resolverProxy()) !== offChainResolverDeployment.address
  ) {
    await flickContract.setOffchainResolver(offChainResolverDeployment.address);
  }
};
export default func;
func.tags = ["test"];
