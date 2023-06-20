import { EMetadataJobStatus } from "@0xflick/models";
import { TContext } from "../../context";

export async function getJob(
  { metadataJob }: TContext,
  { id }: { id: string }
) {
  return await metadataJob.get(id);
}

export async function listJobsByAddress(
  { metadataJob }: TContext,
  {
    address,
  }: {
    address: string;
  }
) {
  return await metadataJob.listByAddress(address);
}

export async function createJob(
  { metadataJob }: TContext,
  {
    jobId,
    forAddress,
    contractAddress,
    chainId,
  }: {
    jobId: string;
    forAddress: `0x{string}`;
    contractAddress: `0x{string}`;
    chainId: number;
  }
) {
  return await metadataJob.create({
    jobId,
    forAddress,
    contractAddress,
    chainId,
    status: EMetadataJobStatus.PENDING,
    progress: 0,
  });
}
