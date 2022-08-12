import Head from "next/head";
import { defaultI18nConfig } from "locales";
import { DefaultProvider } from "context/default";
import type { GetStaticPaths, NextPage, GetStaticProps } from "next";
import { BigNumber, utils } from "ethers";
import { Seed } from "layouts/Seed";
import "utils/error";

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const { seedId: maybeSeed } = params;
  const seed = Array.isArray(maybeSeed) ? maybeSeed[0] : maybeSeed;

  return {
    props: {
      seed,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

const HomePage: NextPage<{ seed: string }> = ({ seed: seedStr }) => {
  const seed = seedStr && utils.arrayify(BigNumber.from(seedStr));

  return (
    <DefaultProvider i18n={defaultI18nConfig()}>
      <Head>
        <title>0xflick</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Seed seed={seed} />
    </DefaultProvider>
  );
};
export default HomePage;
