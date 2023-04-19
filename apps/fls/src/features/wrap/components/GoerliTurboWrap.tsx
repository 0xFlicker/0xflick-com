import {
  wrappedNftAddress,
  usePrepareBulkMinterSetApprovalForAll,
  useBulkMinterIsApprovedForAll,
  useBulkMinterSetApprovalForAll,
  bulkMinterAddress,
  bulkMinterABI,
} from "@/wagmi";
import { useWeb3 } from "@0xflick/feature-web3";
import { BigNumber } from "ethers";
import { FC, useEffect, useMemo } from "react";
import { useContractReads } from "wagmi";
import { useTokensToWrapLazyQuery } from "../graphql/tokensToWrap.generated";
import { TurboWrapContent } from "./TurboWrapContent";

export const GoerliTurboWrap: FC<{}> = () => {
  const { selectedAddress, currentChain } = useWeb3();
  const isValidToCheckApproval =
    selectedAddress &&
    currentChain &&
    (wrappedNftAddress as any)[currentChain?.id] !== undefined;

  const { data: isApprovedForAll, isFetched: isApprovedForAllFetched } =
    useBulkMinterIsApprovedForAll({
      enabled: isValidToCheckApproval,
      watch: true,
      ...(isValidToCheckApproval && {
        args: [
          selectedAddress,
          (wrappedNftAddress as any)[currentChain?.id] as `0x${string}`,
        ],
      }),
    });
  const { config: configureSetApprovalForAll } =
    usePrepareBulkMinterSetApprovalForAll({
      enabled:
        isValidToCheckApproval && isApprovedForAllFetched && !isApprovedForAll,
      ...(isValidToCheckApproval &&
        isApprovedForAllFetched &&
        !isApprovedForAll && {
          args: [
            (wrappedNftAddress as any)[currentChain?.id] as `0x${string}`,
            true,
          ],
        }),
    });
  const {
    writeAsync: setApprovalForAll,
    isError: approveIsError,
    isLoading: approveIsLoading,
    isSuccess: approveIsSuccess,
  } = useBulkMinterSetApprovalForAll(configureSetApprovalForAll);

  const defaultVariables = useMemo(
    () => ({
      userAddress: selectedAddress || "",
      contractAddress: bulkMinterAddress["5"] || "",
      contractSlug: "go-fame-lady-1" || "",
      testnet: true,
      pageSize: 50,
    }),
    [selectedAddress]
  );
  const [fetchTokens, { data, loading, error }] = useTokensToWrapLazyQuery({
    variables: {
      ...defaultVariables,
    },
  });

  const response = data?.assetsForUserInExactCollection;

  useEffect(() => {
    if (selectedAddress) fetchTokens();
  }, [fetchTokens, selectedAddress]);

  const { data: ownerOfAddress } = useContractReads({
    watch: true,
    contracts: response?.assets.map(({ tokenId: tokenIdStr }) => {
      const tokenId = Number(tokenIdStr);
      return {
        abi: bulkMinterABI,
        address: bulkMinterAddress[5],
        functionName: "ownerOf",
        enabled: !!tokenIdStr,
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
  const validTokens = useMemo(() => {
    return response?.assets.filter(({ tokenId }, index) => {
      const isError: boolean =
        tokenId !== null &&
        // @ts-ignore
        (ownerOfAddress?.[index] !== selectedAddress ||
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
  }, [response?.assets, ownerOfAddress, selectedAddress]);
  const tokenIds = useMemo(
    () => validTokens?.map(({ tokenId }) => BigNumber.from(tokenId)),
    [validTokens]
  );
  return (
    <TurboWrapContent
      approveIsError={approveIsError}
      approveIsSuccess={approveIsSuccess}
      tokenIds={tokenIds ?? []}
      isApprovedForAll={isApprovedForAll}
      setApprovalForAll={setApprovalForAll}
    />
  );
};
