import fetch from "isomorphic-unfetch";
import { TContext } from "../../context";
import { OpenSeaAssetContract } from "../../models/openSea";
import { OpenSeaError } from "../../errors/opensea";

export async function fetchCollectionByContractAddress({
  context,
  contractAddress,
  testnet,
}: {
  context: TContext;
  contractAddress: string;
  testnet?: boolean;
}) {
  const {
    config: { openseaApiKey },
  } = context;
  const response = await fetch(
    `https://${
      testnet ? "testnets-" : ""
    }api.opensea.io/api/v1/asset_contract/${contractAddress}`,
    {
      headers: {
        "X-API-KEY": openseaApiKey,
      },
    }
  );
  const asset = (await response.json()) as OpenSeaAssetContract;
  if (!asset.collection) {
    throw new OpenSeaError(
      "Collection not found",
      "ERROR_OPENSEA_NO_COLLECTION_FOUND_FOR_ASSET"
    );
  }
  return asset;
}
