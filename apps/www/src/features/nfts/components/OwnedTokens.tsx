import { FC, useEffect, useState } from "react";
import { useERC721 } from "../hooks";

import CardGrid from "./CardGrid";
import { useAppSelector } from "app/store";
import { selectors as web3Selectors } from "features/web3";

import styles from "./OwnedTokens.module.css";

interface IProps {}
export const OwnedTokens: FC<IProps> = ({}) => {
  const { contract, enumerator } = useERC721();
  const selectedAddress = useAppSelector(web3Selectors.address);
  const [tokens, setTokens] = useState<number[]>([]);

  useEffect(() => {
    async function getTokens() {
      if (enumerator && contract && selectedAddress) {
        const balance = (await contract.balanceOf(selectedAddress)).toNumber();
        const promiseTokens: Promise<number>[] = [];
        for (let i = 0; i < balance; i++) {
          promiseTokens.push(
            enumerator["tokenOfOwnerByIndex(address,address,uint256)"](
              contract.address,
              selectedAddress,
              i
            ).then((n) => n.toNumber())
          );
        }
        const ownedTokens = await Promise.all(promiseTokens);
        setTokens(ownedTokens);
      }
    }
    getTokens().catch((e) => console.error(e));
  }, [contract, enumerator, selectedAddress]);

  return (
    <div className={styles.root}>
      <CardGrid tokens={tokens} />
    </div>
  );
};
