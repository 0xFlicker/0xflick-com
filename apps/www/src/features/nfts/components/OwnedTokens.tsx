import { FC, useEffect, useState } from "react";
import { useERC721 } from "../hooks";

import CardGrid from "./CardGrid";
import { useAppSelector } from "app/store";
import { selectors as web3Selectors } from "@0xflick/feature-web3";

import styles from "./OwnedTokens.module.css";

interface IProps {}
export const OwnedTokens: FC<IProps> = ({}) => {
  const { contract } = useERC721();
  const selectedAddress = useAppSelector(web3Selectors.address);
  const [tokens, setTokens] = useState<number[]>([]);

  useEffect(() => {
    async function getTokens() {
      if (contract && selectedAddress) {
        setTokens(
          (await contract.tokensOfOwner(selectedAddress)).map((t) =>
            t.toNumber()
          )
        );
      }
    }
    getTokens().catch((e) => console.error(e));
  }, [contract, selectedAddress]);

  return (
    <div className={styles.root}>
      <CardGrid tokens={tokens} />
    </div>
  );
};
