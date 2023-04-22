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
import {
  bulkMinterAddress,
  bulkMinterABI,
  fameLadySquadABI,
  fameLadySquadAddress,
  useFameLadySquadBalanceOf,
} from "@/wagmi";
import { BigNumber } from "ethers";
import { useContractReads } from "wagmi";
import { useWeb3 } from "@0xflick/feature-web3";

export const MainnetTokenSelect: FC<{
  onSelected: (selected: string[]) => void;
}> = ({ onSelected }) => {
  const { currentChain, selectedAddress } = useWeb3();
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  useEffect(() => {
    onSelected(tokenIds);
  }, [tokenIds, onSelected]);

  const { data: balanceOf } = useFameLadySquadBalanceOf({
    enabled: selectedAddress !== undefined,
    watch: true,
    ...(selectedAddress !== undefined && {
      args: [selectedAddress],
    }),
  });
  const { data: ownedTokens } = useContractReads({
    watch: true,
    contracts:
      selectedAddress !== undefined && balanceOf !== undefined
        ? (Array.from({ length: balanceOf.toNumber() }).map((_, index) => ({
            abi: fameLadySquadABI,
            address: fameLadySquadAddress[currentChain?.id] as `0x${string}`,
            functionName: "tokenOfOwnerByIndex",
            args: [selectedAddress, BigNumber.from(index)],
          })) as {
            abi: typeof fameLadySquadABI;
            address: `0x${string}`;
            functionName: "tokenOfOwnerByIndex";
            args: [string, BigNumber];
          }[])
        : [],
  });

  const validTokens = useMemo(() => {
    return (ownedTokens ?? [])
      .filter((t) => !!t)
      .map((tokenId) => {
        return tokenId.toString();
      });
  }, [ownedTokens]);
  return (
    <>
      <Grid2 container spacing={1}>
        {validTokens.map((tokenId) => (
          <Grid2 xs={12} sm={6} md={4} lg={3} key={tokenId}>
            <Card>
              <CardActionArea
                onClick={() => {
                  if (tokenIds.includes(tokenId)) {
                    setTokenIds(tokenIds.filter((id) => id !== tokenId));
                  } else {
                    setTokenIds([...tokenIds, tokenId]);
                  }
                }}
                sx={{
                  ...(tokenIds.includes(tokenId) && {
                    borderColor: "primary.main",
                    borderStyle: "solid",
                    borderWidth: 5,
                  }),
                }}
              >
                <CardHeader title={tokenId} />
                <CardMedia
                  component="img"
                  image={`https://img.fameladysociety.com/thumb/${tokenId}`}
                  sx={{
                    objectFit: "contain",
                    width: "100%",
                    transition: "transform 0.5s ease-in-out",
                  }}
                />
              </CardActionArea>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </>
  );
};
