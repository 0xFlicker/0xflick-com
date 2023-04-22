import { FC } from "react";
import { useWeb3 } from "@0xflick/feature-web3";
import { GoerliTurboWrap } from "./GoerliTurboWrap";
import { MainnetTurboWrap } from "./MainnetTurboWrap";

export const TurboWrap: FC<{}> = () => {
  const { currentChain } = useWeb3();
  return (() => {
    switch (currentChain?.id) {
      case 5:
        return <GoerliTurboWrap />;
      case 1:
        return <MainnetTurboWrap />;
      default:
        return null;
    }
  })();
};
