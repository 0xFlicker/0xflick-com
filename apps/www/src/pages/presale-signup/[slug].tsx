import Head from "next/head";
import { defaultI18nConfig, I18nProps } from "locales";
import { DefaultProvider } from "context/default";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { PreSaleSignup } from "layouts/PreSaleSignup";
import { fetchTableNames, getDb, AffiliateDAO } from "@0xflick/backend";

const db = getDb();
const affiliateDao = new AffiliateDAO(db);
const promiseTableNames = fetchTableNames();

type TProps = I18nProps & { affiliate: string };
export const getStaticProps: GetStaticProps<TProps> = async (context) => {
  const { params } = context;
  const { slug: maybeSlug } = params;
  const slug = Array.isArray(maybeSlug) ? maybeSlug[0] : maybeSlug;
  const i18n = defaultI18nConfig();

  // check if slug is valid
  await promiseTableNames;
  const affiliate = await affiliateDao.getAffiliate(slug);

  if (!affiliate) {
    console.log("redirecting to presale signup");
    return {
      redirect: {
        destination: "/presale-signup",
      },
      props: {
        i18n,
        affiliate: "",
      },
    };
  }
  return {
    props: {
      i18n,
      affiliate: affiliate.address,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  await promiseTableNames;
  const allAffiliates = await affiliateDao.getAllAffiliates();
  return {
    paths: allAffiliates.map((affiliate) => ({
      params: {
        slug: affiliate.slug,
      },
    })),
    fallback: true,
  };
};
const PresaleSignupPage: NextPage<TProps> = ({ i18n, affiliate }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>Nameflick presale signup</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <PreSaleSignup affiliate={affiliate} />
    </DefaultProvider>
  );
};
export default PresaleSignupPage;
