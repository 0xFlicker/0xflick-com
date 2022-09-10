export interface IPaginatedResult<T> {
  items: T[];
  cursor: string | null;
  count: number;
  size: number;
  page: number;
}

export interface IProjectionOptions {
  attributes?: string[];
}

export interface IPaginationOptions {
  cursor?: string;
  limit?: number;
}

export interface IPaginationCursor {
  lastEvaluatedKey: any;
  page: number;
  count: number;
}

export interface IDeployConfig {
  infraIpfsUrl: string;
  infraIpfsProjectId: string;
  infraIpfsSecret: string;
  chains: Record<
    string,
    {
      name: string;
      rpc: string;
      nftRootCollection: string;
      ens?: {
        registry: string;
      };
    }
  >;
}
