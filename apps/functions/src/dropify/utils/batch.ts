import {
  IMetadataFetchEventDetailStart,
  IMetadataFetchEventDetailProcessChunk,
} from "@0xflick/models";

/*
Responsible for taking a single metadata-fetch-start and turning it into a series of metadata-fetch-process-chunk events.
*/

export function batchEvents(
  event: IMetadataFetchEventDetailStart,
  batchSize: number
): IMetadataFetchEventDetailProcessChunk[] {
  const { jobId, contractAddress, chainId, tokenIds } = event;
  // we assume that the tokenIds array has been filled out by the caller
  const events: IMetadataFetchEventDetailProcessChunk[] = [];
  for (let i = 0; i < tokenIds.length; i += batchSize) {
    const chunk = tokenIds.slice(i, i + batchSize);
    events.push({
      chainId,
      contractAddress,
      jobId,
      tokenIds: chunk,
    });
  }
  return events;
}
