import { create, IPFSHTTPClient } from "ipfs-http-client";

export function createInfuraIpfsClient() {
  if (!process.env.INFURA_IPFS_AUTH) {
    throw new Error("INFURA_IPFS_AUTH is not set");
  }
  const INFURA_IPFS_AUTH = process.env.INFURA_IPFS_AUTH;

  return create({
    host: "ipfs.infura.io:5001",
    protocol: "https",
    headers: {
      Authorization: INFURA_IPFS_AUTH,
    },
  });
}

export async function loadIpfsContent(
  ipfsClient: IPFSHTTPClient,
  ipfsCid: string
) {
  const contents: Uint8Array[] = [];
  for await (let metadataBuf of ipfsClient.cat(ipfsCid)) {
    contents.push(metadataBuf);
  }
  return Buffer.concat(contents);
}
