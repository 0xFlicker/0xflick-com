import Head from "next/head";
import { MyTokens } from "layouts/MyTokens";
import { NextPage } from "next";
import { DefaultProvider } from "context/default";
import type { IStaticProps } from "context/staticProps";

export { getStaticProps } from "context/staticProps";

const Page: NextPage<IStaticProps> = ({ i18n, theme }) => {
  return (
    <DefaultProvider i18n={i18n} initialTheme={theme}>
      <Head>
        <title>Nameflick Demo</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <MyTokens />
    </DefaultProvider>
  );
};
export default Page;
