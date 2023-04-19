import { FC, useEffect, useMemo, useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";

import {
  useTokensToWrapLazyQuery,
  TokensToWrapQuery,
} from "../graphql/tokensToWrap.generated";
import { Button } from "@mui/material";
import { bulkMinterAddress, bulkMinterABI } from "@/wagmi";
import { BigNumber } from "ethers";
import { useContractReads } from "wagmi";

export const TokenSelect: FC<{
  contractAddress?: string;
  userAddress?: string;
  contractSlug?: string;
  testnet?: boolean;
  onSelected: (selected: string[]) => void;
  minTokenId: number;
  maxTokenId: number;
}> = ({
  contractAddress,
  userAddress,
  contractSlug,
  testnet,
  onSelected,
  minTokenId,
  maxTokenId,
}) => {
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [loadedTokens, setLoadedTokens] = useState<
    TokensToWrapQuery["assetsForUserInExactCollection"]["assets"]
  >([]);

  const { data: ownerOfAddress } = useContractReads({
    watch: true,
    contracts: loadedTokens.map(({ tokenId: tokenIdStr }) => {
      const tokenId = Number(tokenIdStr);
      return {
        abi: bulkMinterABI,
        address: bulkMinterAddress[5],
        functionName: "ownerOf",
        enabled:
          tokenIdStr !== null && tokenId >= minTokenId && tokenId <= maxTokenId,
        ...(Number.isInteger(tokenId) && {
          args: [BigNumber.from(tokenId)],
        }),
      };
    }) as {
      abi: typeof bulkMinterABI;
      address: `0x${string}`;
      functionName: "ownerOf";
    }[],
  });

  const defaultVariables = useMemo(
    () => ({
      userAddress: userAddress || "",
      contractAddress: contractAddress || "",
      contractSlug: contractSlug || "",
      testnet: testnet,
      pageSize: 50,
    }),
    [contractAddress, contractSlug, testnet, userAddress]
  );
  const [fetchTokens, { data, loading, error }] = useTokensToWrapLazyQuery({
    variables: {
      ...defaultVariables,
    },
  });

  const response = data?.assetsForUserInExactCollection;

  useEffect(() => {
    if (userAddress && contractAddress) fetchTokens();
  }, [contractAddress, fetchTokens, userAddress]);

  const validTokens = useMemo(() => {
    return loadedTokens.filter(({ tokenId }, index) => {
      const isError: boolean =
        tokenId !== null &&
        // @ts-ignore
        (ownerOfAddress?.[index] !== userAddress ||
          // @ts-ignore
          ownerOfAddress?.[index] === undefined ||
          // @ts-ignore
          ownerOfAddress?.[index] === null ||
          // @ts-ignore
          ownerOfAddress?.[index] === "" ||
          // @ts-ignore
          ownerOfAddress?.[index] === "0x");
      return !isError;
    });
  }, [loadedTokens, ownerOfAddress, userAddress]);

  useEffect(() => {
    if (response) {
      setLoadedTokens((loadedTokens) => {
        const newTokens = response.assets.filter(
          (asset) => !loadedTokens.find((t) => t.id === asset.id)
        );
        return [...loadedTokens, ...newTokens];
      });
    }
  }, [response]);

  useEffect(() => {
    // Look for tokens to remove from the tokenId list if they are no longer valid
    const newTokenIds = tokenIds.filter((tokenId) =>
      validTokens.find((asset) => asset.tokenId === tokenId)
    );
    if (newTokenIds.length !== tokenIds.length) {
      setTokenIds(newTokenIds);
    }
    onSelected(newTokenIds);
  }, [onSelected, tokenIds, validTokens]);
  return (
    <>
      <Grid2 container spacing={1}>
        {validTokens.map((asset) => (
          <Grid2 xs={12} sm={6} md={4} lg={3} key={asset.id}>
            <Card>
              <CardActionArea
                onClick={() => {
                  if (tokenIds.includes(asset.tokenId)) {
                    setTokenIds(tokenIds.filter((id) => id !== asset.tokenId));
                  } else {
                    setTokenIds([...tokenIds, asset.tokenId]);
                  }
                }}
                sx={{
                  ...(tokenIds.includes(asset.tokenId) && {
                    borderColor: "primary.main",
                    borderStyle: "solid",
                    borderWidth: 5,
                  }),
                }}
              >
                <CardHeader title={asset.name || asset.tokenId} />
                <CardMedia
                  component="img"
                  image={asset.thumbnailUrl ?? ""}
                  sx={{
                    objectFit: "contain",
                    width: "100%",
                    transition: "transform 0.5s ease-in-out",
                    // ...(tokenIds.includes(asset.tokenId)
                    //   ? {
                    //       transform: "scale(1.2)",
                    //     }
                    //   : {}),
                  }}
                />
              </CardActionArea>
            </Card>
          </Grid2>
        ))}
        {loading && (
          <Grid2 xs={12}>
            <CircularProgress />
          </Grid2>
        )}
        {error && <Grid2 xs={12}>{error.message}</Grid2>}
        {response && response.cursor && (
          <Grid2 xs={12}>
            <Button
              onClick={() => {
                fetchTokens({
                  variables: {
                    ...defaultVariables,
                    cursor: response.cursor,
                  },
                });
              }}
            >
              Load more
            </Button>
          </Grid2>
        )}
      </Grid2>
    </>
  );
};
