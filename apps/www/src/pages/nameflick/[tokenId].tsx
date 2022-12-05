import Head from "next/head";
import { defaultI18nConfig } from "@0xflick/feature-locale";
import { DefaultProvider } from "context/default";
import type { GetStaticPaths, NextPage, GetStaticProps } from "next";
import { INameflickToken } from "@0xflick/models";
import { tokens } from "features/nameflick-manage/fixture";
import { TokenDetails } from "layouts/TokenDetails";

export const getStaticProps: GetStaticProps<{
  token: INameflickToken;
}> = async (context) => {
  const { params } = context;
  const { tokenId: maybeToken } = params;
  const tokenId = Array.isArray(maybeToken) ? maybeToken[0] : maybeToken;
  const token: INameflickToken = {
    ...tokens[Number(tokenId) - 1],
  };
  return {
    props: {
      token,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: ["/nameflick/1", "/nameflick/2", "/nameflick/3"],
    fallback: true,
  };
};

const TokenDetailsPage: NextPage<{ token: INameflickToken }> = ({ token }) => {
  return (
    <DefaultProvider i18n={defaultI18nConfig()}>
      <Head>
        <title>Nameflick #{token?.tokenId ?? "unknown"}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content={token?.metadata?.name} />
        <meta
          property="og:description"
          content={token?.metadata?.description}
        />
        <meta property="og:image" content={token?.metadata?.image} />
      </Head>
      <TokenDetails token={token} />
    </DefaultProvider>
  );
};
export default TokenDetailsPage;
