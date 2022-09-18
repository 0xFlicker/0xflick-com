import { useMemo } from "react";
import { FlickENS__factory, Enumerator__factory } from "@0xflick/contracts";
import { useWeb3 } from "features/web3";
import { useAppSelector } from "app/store";
import { selectors as configSelectors } from "features/config";
import { useSigner } from "wagmi";

export function useERC721(willSign: boolean = false) {
  const { data: signer } = useSigner();
  const { provider } = useWeb3();
  const nftContractAddress = useAppSelector(configSelectors.nftContractAddress);
  const nftEnumeratorContractAddress = useAppSelector(
    configSelectors.nftEnumeratorContractAddress
  );
  const contract = useMemo(() => {
    if (willSign && signer) {
      return FlickENS__factory.connect(nftContractAddress, signer);
    }
    if (provider) {
      return FlickENS__factory.connect(nftContractAddress, provider);
    }
  }, [provider, willSign, signer, nftContractAddress]);
  const enumerator = useMemo(() => {
    // No signer needed as there are no writes to the enumerator
    if (provider) {
      return Enumerator__factory.connect(
        nftEnumeratorContractAddress,
        provider
      );
    }
  }, [provider, nftEnumeratorContractAddress]);

  return {
    contract,
    enumerator,
  };
}
