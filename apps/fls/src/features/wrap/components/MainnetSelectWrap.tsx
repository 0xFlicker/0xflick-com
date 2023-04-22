import {
  fameLadySocietyAddress,
  usePrepareFameLadySquadSetApprovalForAll,
  useFameLadySquadIsApprovedForAll,
  useFameLadySquadSetApprovalForAll,
} from "@/wagmi";
import { useWeb3 } from "@0xflick/feature-web3";
import { FC } from "react";
import { WrapCardContent } from "./WrapCardContent";

export const MainnetSelectWrap: FC<{
  minTokenId: number;
  maxTokenId: number;
}> = ({ minTokenId, maxTokenId }) => {
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

  return (
    <WrapCardContent
      minTokenId={minTokenId}
      maxTokenId={maxTokenId}
      isApprovedForAll={isApprovedForAll}
      setApprovalForAll={setApprovalForAll}
      approveIsError={approveIsError}
      approveIsSuccess={approveIsSuccess}
    />
  );
};
