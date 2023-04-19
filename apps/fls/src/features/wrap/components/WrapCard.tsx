import { FC } from "react";
import { useWeb3 } from "@0xflick/feature-web3";
import { GoerliSelectWrap } from "./GoerliSelectWrap";

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
      default:
        return null;
    }
  })();
};
