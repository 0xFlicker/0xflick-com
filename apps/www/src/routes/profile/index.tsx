import Head from "next/head";
import { ProfileLayout } from "layouts/Profile";
import { NextPage } from "next";
import { DefaultProvider } from "context/default";
import type { IStaticProps } from "context/staticProps";

export { getStaticProps } from "context/staticProps";

const Page: NextPage<IStaticProps> = ({ theme }) => {
  return (
    <DefaultProvider initialTheme={theme}>
      <Head>
        <title>Profile</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ProfileLayout />
    </DefaultProvider>
  );
};
export default Page;
