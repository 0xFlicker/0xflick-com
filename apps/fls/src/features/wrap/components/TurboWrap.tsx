import { FC } from "react";
import { useWeb3 } from "@0xflick/feature-web3";
import { GoerliTurboWrap } from "./GoerliTurboWrap";

export const TurboWrap: FC<{}> = () => {
  const { currentChain } = useWeb3();
  return (() => {
    switch (currentChain?.id) {
      case 5:
        return <GoerliTurboWrap />;
      default:
        return null;
    }
  })();
};
