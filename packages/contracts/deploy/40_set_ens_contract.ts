import { utils } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  ENSRegistry__factory,
  BaseRegistrarImplementation__factory,
  ReverseRegistrar__factory,
  PublicResolver__factory,
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
  const registryDeployment = await deployments.get("ENSRegistry");
  const registry = ENSRegistry__factory.connect(
    registryDeployment.address,
    signer
  );
  const resolverDeployment = await deployments.get("FlickENS");

  if (
    !(await registry.recordExists(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ))
  ) {
    console.log(`Setting the root tld`);
    const tx = await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("eth"),
      deployer,
      { from: deployer }
    );
    await tx.wait(1);
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
  let tx = await registry.setSubnodeOwner(
    ethers.utils.namehash("eth"),
    ethers.utils.id("cmdrnft"),
    deployer,
    { from: deployer }
  );
  await tx.wait();
  console.log(`Registering flick's ENS domain`);
  tx = await registry.setSubnodeOwner(
    ethers.utils.namehash("eth"),
    ethers.utils.id("0xflick"),
    deployer,
    { from: deployer }
  );
  await tx.wait();
  console.log(`Registering flick's ENS domain`);
  tx = await registry.setSubnodeOwner(
    ethers.utils.namehash("eth"),
    ethers.utils.id("nameflick"),
    deployer,
    { from: deployer }
  );
  await tx.wait();
  console.log(`Setting the registrar`);
  tx = await registry.setResolver(
    utils.namehash("cmdrnft.eth"),
    resolverDeployment.address,
    {
      from: deployer,
    }
  );
  await tx.wait();
  tx = await registry.setResolver(
    utils.namehash("0xflick.eth"),
    resolverDeployment.address,
    {
      from: deployer,
    }
  );
  await tx.wait();
  tx = await registry.setResolver(
    utils.namehash("nameflick.eth"),
    resolverDeployment.address,
    {
      from: deployer,
    }
  );
  await tx.wait();

  // Configure reverse registrar + public resolver
  const reverseRegistrarDeployment = await deployments.get("ReverseRegistrar");
  const reverseRegistrar = ReverseRegistrar__factory.connect(
    reverseRegistrarDeployment.address,
    signer
  );
  const publicResolverDeployment = await deployments.get("PublicResolver");
  const publicResolver = PublicResolver__factory.connect(
    publicResolverDeployment.address,
    signer
  );
  if (
    !((await reverseRegistrar.defaultResolver()) !== publicResolver.address)
  ) {
    console.log(`Setting the default resolver`);
    tx = await reverseRegistrar.setDefaultResolver(publicResolver.address, {
      from: deployer,
    });
    await tx.wait();
  }
  // Check if the .addr.reverse domain is owned by the reverse registrar
  if (
    !(
      (await registry.owner(utils.namehash("addr.reverse"))) ===
      reverseRegistrar.address
    )
  ) {
    console.log(`Setting the reverse registrar`);
    tx = await registry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      utils.id("reverse"),
      reverseRegistrar.address,
      { from: deployer }
    );
    await tx.wait();

    tx = await registry.setSubnodeOwner(
      utils.namehash("reverse"),
      utils.id("addr"),
      reverseRegistrar.address,
      { from: deployer }
    );
    await tx.wait();
  }

  // Check reverse registrar is configured for deployer => 0xflick.eth
  if (
    !(await registry.recordExists(utils.namehash(`${deployer}.addr.reverse`)))
  ) {
    console.log(`Setting the reverse record`);
    tx = await reverseRegistrar.setName("0xflick.eth", { from: deployer });
    await tx.wait();
  }
};
export default func;
func.tags = ["test"];
