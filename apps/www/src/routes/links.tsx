import Head from "next/head";
import { Links } from "layouts/Links";
import { NextPage } from "next";
import { DefaultProvider } from "context/default";
import type { IStaticProps } from "context/staticProps";

export { getStaticProps } from "context/staticProps";

const LinksPage: NextPage<IStaticProps> = ({ i18n, theme }) => {
  return (
    <DefaultProvider i18n={i18n} initialTheme={theme}>
      <Head>
        <title>Nameflick Links</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Links />
    </DefaultProvider>
  );
};
export default LinksPage;
