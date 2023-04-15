import fetch from "isomorphic-unfetch";
import { TContext } from "../../context";
import { OpenSeaAsset } from "../../models/openSea";
import { createLogger } from "@0xflick/backend";

const logger = createLogger({
  name: "graphql/controllers/opensea/assets",
});

export async function fetchAssetsForUserInExactCollection({
  context,
  userAddress,
  contractAddress,
  contractSlug,
  testnet,
  offset,
  limit,
}: {
  context: TContext;
  userAddress: string;
  contractAddress: string;
  contractSlug: string;
  testnet?: boolean;
  offset: number;
  limit: number;
}) {
  const {
    config: { openseaApiKey },
  } = context;
  const params = new URLSearchParams({
    owner: userAddress,
    asset_contract_address: contractAddress,
    order_direction: "desc",
    offset: offset.toString(),
    limit: limit.toString(),
    collection: contractSlug,
    include_orders: "false",
  });
  logger.debug(
    `Using testnet ${testnet}, Fetching assets for user ${userAddress} in collection ${contractSlug} with params ${params.toString()}`
  );
  const response = await fetch(
    `https://${
      testnet ? "testnets-" : ""
    }api.opensea.io/api/v1/assets?${params.toString()}`,
    !testnet
      ? {
          headers: {
            "X-API-KEY": openseaApiKey,
          },
        }
      : {}
  );

  const asset = (await response.json()) as {
    assets: OpenSeaAsset[];
  };
  return asset;
}
