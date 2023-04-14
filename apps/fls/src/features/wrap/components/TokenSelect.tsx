import { FC, useEffect, useMemo, useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import GreaterThanIcon from "@mui/icons-material/ArrowForwardIos";
import LessThenIcon from "@mui/icons-material/ArrowBackIos";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import NextImage from "next/image";

import {
  useTokensToWrapLazyQuery,
  TokensToWrapQuery,
} from "../graphql/tokensToWrap.generated";
import { Button } from "@mui/material";

export const TokenSelect: FC<{
  contractAddress?: string;
  userAddress?: string;
  contractSlug?: string;
  testnet?: boolean;
  onSelected: (selected: string[]) => void;
  tokenIds: string[];
}> = ({
  tokenIds,
  contractAddress,
  userAddress,
  contractSlug,
  testnet,
  onSelected,
}) => {
  const [loadedTokens, setLoadedTokens] = useState<
    TokensToWrapQuery["assetsForUserInExactCollection"]["assets"]
  >([]);

  const defaultVariables = useMemo(
    () => ({
      userAddress: userAddress || "",
      contractAddress: contractAddress || "",
      contractSlug: contractSlug || "",
      testnet: testnet,
      pageSize: 12,
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
    if (userAddress && contractAddress) fetchTokens();
  }, [contractAddress, fetchTokens, userAddress]);
  return (
    <>
      <Grid2 container spacing={1}>
        {loadedTokens.map((asset) => (
          <Grid2 xs={12} sm={6} md={4} lg={3} key={asset.id}>
            <Card>
              <CardActionArea
                onClick={() => {
                  if (tokenIds.includes(asset.tokenId)) {
                    onSelected(tokenIds.filter((id) => id !== asset.tokenId));
                  } else {
                    onSelected([...tokenIds, asset.tokenId]);
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
                <CardContent>
                  {asset.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.thumbnailUrl}
                      style={{
                        objectFit: "contain",
                        width: "100%",

                        transition: "transform 0.5s ease-in-out",
                        ...(tokenIds.includes(asset.tokenId)
                          ? {
                              transform: "rotateY(180deg)",
                            }
                          : {}),
                      }}
                      alt={asset.name || asset.tokenId}
                    />
                  )}
                </CardContent>
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
