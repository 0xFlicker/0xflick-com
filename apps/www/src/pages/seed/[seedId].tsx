import Head from "next/head";
import { defaultI18nConfig } from "locales";
import { DefaultProvider } from "context/default";
import type { GetStaticPaths, NextPage, GetStaticProps } from "next";
import { BigNumber, utils } from "ethers";
import { Seed } from "layouts/Seed";
import { generateTraits, IAttributeMetadata } from "@0xflick/assets";
import "utils/error";

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const { seedId: maybeSeed } = params;
  const seed = Array.isArray(maybeSeed) ? maybeSeed[0] : maybeSeed;
  const { metadata } = generateTraits(utils.arrayify(BigNumber.from(seed)));
  return {
    props: {
      seed,
      metadata,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

const HomePage: NextPage<{ seed?: string; metadata?: IAttributeMetadata }> = ({
  seed: seedStr,
  metadata,
}) => {
  const seed = seedStr && utils.arrayify(BigNumber.from(seedStr));

  const description = `Axolotl Valley - [Seed: ${seedStr?.slice(0, 8) ?? ""}] ${
    metadata?.attributes
      ?.map(({ trait_type, value }) => `[${trait_type}: ${value}]`)
      .join(" ") ?? ""
  }`;
  return (
    <DefaultProvider i18n={defaultI18nConfig()}>
      <Head>
        <title>0xflick</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="Axolotl Valley seed preview" />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_IMAGE_RESIZER}/axolotl-seed/${seedStr}`}
        />
      </Head>
      <Seed seed={seed} />
    </DefaultProvider>
  );
};
export default HomePage;
