import { GetStaticProps, NextPage } from "next";
import { Nfts } from "layouts/Nfts";
import { DefaultProvider } from "context/default";
import { getStaticProps as getStaticPropsLocale } from "locales";
import {
  createLogger,
  ensRpcUrl,
  flickEnsDomain,
  getEnumerableNftTokens,
  web3RpcUrl,
} from "@0xflick/backend";
import { INfts } from "@0xflick/models";
import { merge } from "merge-anything";
import { InitOptions } from "i18next";
import { providers } from "ethers";
import { nftCollectionsOfInterest } from "utils/config";

interface IPageProps {
  i18n: InitOptions;
  serverSideNfts?: INfts[];
}

async function getStaticPropsNftCollection() {
  const logger = createLogger({
    name: "getStaticPropsNftCollection",
  });
  const ensProvider = new providers.JsonRpcProvider(ensRpcUrl.get());
  const provider = new providers.JsonRpcProvider(web3RpcUrl.get());
  let myAddress: string;
  try {
    logger.info("Getting my address");
    myAddress = await ensProvider.resolveName(flickEnsDomain.get());
  } catch (err: any) {
    logger.error(`Could not resolve flick address: ${err.code}`, err);
    throw err;
  }
  if (!myAddress) {
    throw new Error("ENS resolved to null");
  }
  logger.info(`Resolved ENS to ${myAddress}`);
  const nfts = await Promise.all(
    nftCollectionsOfInterest
      .get()
      .map((collection) =>
        getEnumerableNftTokens(
          logger,
          myAddress,
          collection.address,
          provider,
          collection.isEnumerable
        )
      )
  );
  return {
    props: {
      serverSideNfts: nfts,
    },
  };
}

export const getStaticProps: GetStaticProps<IPageProps> = async (...args) => {
  return merge(
    ...(await Promise.all([
      getStaticPropsLocale(...args),
      getStaticPropsNftCollection(),
    ]))
  );
};

const Page: NextPage<IPageProps & { i18n: InitOptions }> = ({
  serverSideNfts,
  i18n,
}) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Nfts serverSideNfts={serverSideNfts} />
    </DefaultProvider>
  );
};

export default Page;
