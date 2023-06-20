import { IPFSHTTPClient, create } from "ipfs-http-client";

export async function loadIpfsContent(
  ipfsClient: IPFSHTTPClient,
  ipfsCid: string
) {
  const contents: Uint8Array[] = [];
  for await (const metadataBuf of ipfsClient.cat(ipfsCid)) {
    contents.push(metadataBuf);
  }
  return Buffer.concat(contents);
}

export function createIpfsClient() {
  if (!process.env.IPFS_AUTH) {
    throw new Error("IPFS_AUTH is not set");
  }

  const IPFS_API = "ipfs.infura.io:5001";

  return create({
    host: IPFS_API,
    protocol: "https",
    headers: {
      Authorization: process.env.IPFS_AUTH,
    },
  });
}
