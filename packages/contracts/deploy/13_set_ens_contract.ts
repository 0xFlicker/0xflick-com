import { utils } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  ENSRegistry__factory,
  OffchainResolver__factory,
  BaseRegistrarImplementation__factory,
} from "../typechain";

const func: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) => {
  const { deploy, getArtifact } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const baseRegistrarDeployment = await deployments.get(
    "BaseRegistrarImplementation"
  );
  const baseRegistrar = BaseRegistrarImplementation__factory.connect(
    baseRegistrarDeployment.address,
    signer
  );
  console.log(
    `Reusing existing BaseRegistrar at ${baseRegistrarDeployment.address}`
  );
  const registryDeployment = await deployments.get("ENSRegistry");
  console.log(`Reusing existing ENSRegistry at ${registryDeployment.address}`);
  const registry = ENSRegistry__factory.connect(
    registryDeployment.address,
    signer
  );
  const resolverDeployment = await deployments.get("OffchainResolver");
  console.log(
    `Reusing existing OffchainResolver at ${resolverDeployment.address}`
  );
  const resolver = OffchainResolver__factory.connect(
    resolverDeployment.address,
    signer
  );

  if (
    (await registry.owner(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )) !== deployer
  ) {
    console.log(`Setting the root tld`);
    await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.namehash("eth"),
      deployer,
      { from: deployer }
    );
  }

  // Set the deployer as a controller
  if ((await baseRegistrar.controllers(deployer)) !== true) {
    console.log(`Setting the deployer as a controller`);
    const receipt = await baseRegistrar.addController(deployer, {
      from: deployer,
    });
    await receipt.wait(1);
  }

  console.log(`Registering the admin ENS domain`);
  await registry.setSubnodeOwner(
    ethers.utils.namehash("eth"),
    ethers.utils.id("cmdrnft"),
    deployer,
    { from: deployer }
  );
  console.log(`Registering flick's ENS domain`);
  await registry.setSubnodeOwner(
    ethers.utils.namehash("eth"),
    ethers.utils.id("0xflick"),
    deployer,
    { from: deployer }
  );
  console.log(`Setting the registrar`);
  await registry.setResolver(utils.namehash("cmdrnft.eth"), resolver.address, {
    from: deployer,
  });
  await registry.setResolver(utils.namehash("0xflick.eth"), resolver.address, {
    from: deployer,
  });
};
export default func;
func.tags = ["test"];
