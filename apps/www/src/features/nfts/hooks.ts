import { useMemo } from "react";
import { FlickENS__factory } from "@0xflick/contracts";
import { useWeb3 } from "features/web3";
import { useAppSelector } from "app/store";
import { selectors as configSelectors } from "features/config";
import { useSigner } from "wagmi";

export function useERC721(willSign: boolean = false) {
  const { data: signer } = useSigner();
  const { provider } = useWeb3();
  const nftContractAddress = useAppSelector(configSelectors.nftContractAddress);
  const contract = useMemo(() => {
    if (willSign && signer) {
      return FlickENS__factory.connect(nftContractAddress, signer);
    }
    if (provider) {
      return FlickENS__factory.connect(nftContractAddress, provider);
    }
  }, [provider, willSign, signer, nftContractAddress]);

  return {
    contract,
  };
}
