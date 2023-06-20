export enum EMetadataJobStatus {
  PENDING = "pending",
  IN_PROGRESS = "in progress",
  COMPLETE = "complete",
  FAILED = "failed",
  STOPPED = "stopped",
}

export interface IMetadataJob {
  jobId: string;
  forAddress: `0x{string}`;
  status: EMetadataJobStatus;
  total: number;
  totalSuccess: number;
  totalFailed: number;
  contractAddress: `0x{string}`;
  chainId: number;
  createdAt: Date;
  updatedAt: Date;
}

export function isValidMetadataJobStatus(status: string): boolean {
  return Object.values(EMetadataJobStatus).includes(
    status as EMetadataJobStatus
  );
}

export enum EMetadataFetchEventDetailType {
  START = "metadata_fetch_start",
  PROCESS_CHUNK = "metadata_fetch_process_chunk",
  STOP = "metadata_fetch_stop",
  PROGRESS = "metadata_fetch_progress",
  COMPLETE = "metadata_fetch_complete",
  FAILED = "metadata_fetch_failed",
}

export interface IMetadataFetchEventDetailStart {
  jobId: string;
  contractAddress: string;
  chainId: number;
  tokenIds: string[];
  tokenIdStart: number;
  tokenIdEnd: number;
}

export interface IMetadataFetchEventStart {
  DetailType: EMetadataFetchEventDetailType.START;
  Detail: IMetadataFetchEventDetailStart;
}

export interface IMetadataFetchEventDetailStop {
  jobId: string;
}

export interface IMetadataFetchEventStop {
  DetailType: EMetadataFetchEventDetailType.STOP;
  Detail: IMetadataFetchEventDetailStop;
}

export interface IMetadataFetchEventDetailProcessChunk {
  jobId: string;
  contractAddress: string;
  chainId: number;
  tokenIds: string[];
}

export interface IMetadataFetchEventProcessChunk {
  DetailType: EMetadataFetchEventDetailType.PROCESS_CHUNK;
  Detail: IMetadataFetchEventDetailProcessChunk;
}

export interface IMetadataFetchEventDetailProgress {
  jobId: string;
  successTokenIds?: string[];
  failedTokenIds?: string[];
}
export interface IMetadataFetchEventProgress {
  DetailType: EMetadataFetchEventDetailType.PROGRESS;
  Detail: IMetadataFetchEventDetailProgress;
}

export interface IMetadataFetchEventDetailComplete {
  jobId: string;
}
export interface IMetadataFetchEventComplete {
  DetailType: EMetadataFetchEventDetailType.COMPLETE;
  Detail: IMetadataFetchEventDetailComplete;
}

export interface IMetadataFetchEventDetailFailed {
  jobId: string;
  tokenIds: string[];
}
export interface IMetadataFetchEventFailed {
  DetailType: EMetadataFetchEventDetailType.FAILED;
  Detail: IMetadataFetchEventDetailFailed;
}

export type IMetadataFetchEvent =
  | IMetadataFetchEventStart
  | IMetadataFetchEventStop
  | IMetadataFetchEventProcessChunk
  | IMetadataFetchEventProgress
  | IMetadataFetchEventComplete
  | IMetadataFetchEventFailed;
