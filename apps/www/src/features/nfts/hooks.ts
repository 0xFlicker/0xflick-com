import { useMemo } from "react";
import { FlickENS__factory, Enumerator__factory } from "@0xflick/contracts";
import { useWeb3 } from "features/web3";
import { useAppSelector } from "app/store";
import { selectors as configSelectors } from "features/config";
import { JsonRpcSigner } from "@ethersproject/providers";

export function useERC721(useSigner: boolean = false) {
  const { provider } = useWeb3();
  let signer: JsonRpcSigner | undefined;
  if (useSigner) {
    signer = provider?.getSigner();
  }
  const nftContractAddress = useAppSelector(configSelectors.nftContractAddress);
  const nftEnumeratorContractAddress = useAppSelector(
    configSelectors.nftEnumeratorContractAddress
  );
  const contract = useMemo(() => {
    if (useSigner && signer) {
      return FlickENS__factory.connect(nftContractAddress, signer);
    }
    if (provider) {
      return FlickENS__factory.connect(nftContractAddress, signer);
    }
  }, [provider, useSigner, signer, nftContractAddress]);
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
