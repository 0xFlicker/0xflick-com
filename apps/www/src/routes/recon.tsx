import Head from "next/head";
import { Recon } from "layouts/Recon";
import { NextPage } from "next";
import { DefaultProvider } from "context/default";
import type { IStaticProps } from "context/staticProps";

export { getStaticProps } from "context/staticProps";

const Page: NextPage<IStaticProps> = ({ i18n, theme }) => {
  return (
    <DefaultProvider i18n={i18n} initialTheme={theme}>
      <Head>
        <title>Recon</title>
      </Head>
      <Recon />
    </DefaultProvider>
  );
};
export default Page;
