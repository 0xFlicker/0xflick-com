import { FC } from "react";
import { useWeb3 } from "@0xflick/feature-web3";
import { GoerliSelectWrap } from "./GoerliSelectWrap";
import { MainnetSelectWrap } from "./MainnetSelectWrap";

export const WrapCard: FC<{ minTokenId: number; maxTokenId: number }> = ({
  minTokenId,
  maxTokenId,
}) => {
  const { currentChain } = useWeb3();
  return (() => {
    switch (currentChain?.id) {
      case 5:
        return (
          <GoerliSelectWrap minTokenId={minTokenId} maxTokenId={maxTokenId} />
        );
      case 1:
        return (
          <MainnetSelectWrap minTokenId={minTokenId} maxTokenId={maxTokenId} />
        );
      default:
        return null;
    }
  })();
};
