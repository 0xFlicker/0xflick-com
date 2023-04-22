import {
  wrappedNftAddress,
  usePrepareBulkMinterSetApprovalForAll,
  useBulkMinterIsApprovedForAll,
  useBulkMinterSetApprovalForAll,
} from "@/wagmi";
import { useWeb3 } from "@0xflick/feature-web3";
import { FC } from "react";
import { WrapCardContent } from "./WrapCardContent";

export const GoerliSelectWrap: FC<{
  minTokenId: number;
  maxTokenId: number;
}> = ({ minTokenId, maxTokenId }) => {
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

  return (
    <WrapCardContent
      minTokenId={minTokenId}
      maxTokenId={maxTokenId}
      isApprovedForAll={isApprovedForAll}
      setApprovalForAll={setApprovalForAll}
      approveIsError={approveIsError}
      approveIsSuccess={approveIsSuccess}
      testnet
    />
  );
};
