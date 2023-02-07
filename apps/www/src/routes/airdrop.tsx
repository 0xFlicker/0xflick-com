import Head from "next/head";
import { Airdrop } from "layouts/Airdrop";
import { NextPage } from "next";
import { DefaultProvider } from "context/default";
import type { IStaticProps } from "context/staticProps";

export { getStaticProps } from "context/staticProps";

const Page: NextPage<IStaticProps> = ({ i18n, theme }) => {
  return (
    <DefaultProvider i18n={i18n} initialTheme={theme}>
      <Head>
        <title>Nameflick Airdrop Tools</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Airdrop />
    </DefaultProvider>
  );
};
export default Page;
