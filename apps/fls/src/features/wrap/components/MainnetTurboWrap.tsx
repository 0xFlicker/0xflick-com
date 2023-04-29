import {
  fameLadySocietyAddress,
  usePrepareFameLadySquadSetApprovalForAll,
  useFameLadySquadIsApprovedForAll,
  useFameLadySquadSetApprovalForAll,
  fameLadySquadAddress,
  useFameLadySquadBalanceOf,
  fameLadySquadABI,
} from "@/wagmi";
import { useWeb3 } from "@0xflick/feature-web3";
import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import { useContractReads } from "wagmi";
import { TurboWrapContent } from "./TurboWrapContent";

export const MainnetTurboWrap: FC<{}> = () => {
  const { selectedAddress, currentChain } = useWeb3();

  const isValidToCheckApproval =
    selectedAddress &&
    currentChain &&
    fameLadySocietyAddress[currentChain?.id] !== undefined;

  const { data: isApprovedForAll, isFetched: isApprovedForAllFetched } =
    useFameLadySquadIsApprovedForAll({
      enabled: isValidToCheckApproval,
      watch: true,
      ...(isValidToCheckApproval && {
        args: [
          selectedAddress,
          fameLadySocietyAddress[currentChain?.id] as `0x${string}`,
        ],
      }),
    });
  const { config: configureSetApprovalForAll } =
    usePrepareFameLadySquadSetApprovalForAll({
      enabled:
        isValidToCheckApproval && isApprovedForAllFetched && !isApprovedForAll,
      ...(isValidToCheckApproval &&
        isApprovedForAllFetched &&
        !isApprovedForAll && {
          args: [
            fameLadySocietyAddress[currentChain?.id] as `0x${string}`,
            true,
          ],
        }),
    });
  const {
    writeAsync: setApprovalForAll,
    isError: approveIsError,
    isLoading: approveIsLoading,
    isSuccess: approveIsSuccess,
  } = useFameLadySquadSetApprovalForAll(configureSetApprovalForAll);

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

  const tokenIds = useMemo(() => {
    return (ownedTokens ?? []).filter((tokenId) => !!tokenId) as BigNumber[];
  }, [ownedTokens]);

  return (
    <TurboWrapContent
      approveIsError={approveIsError}
      approveIsSuccess={approveIsSuccess}
      tokenIds={tokenIds}
      isApprovedForAll={isApprovedForAll}
      setApprovalForAll={setApprovalForAll}
      testnet={false}
    />
  );
};
