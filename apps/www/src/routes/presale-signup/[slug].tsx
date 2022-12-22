import Head from "next/head";
import { DefaultProvider } from "context/default";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { PreSaleSignup } from "layouts/PreSaleSignup";
import { fetchTableNames, getDb, AffiliateDAO } from "@0xflick/backend";
import {
  IStaticProps,
  getStaticProps as getDefaultStaticProps,
} from "context/staticProps";

const db = getDb();
const affiliateDao = new AffiliateDAO(db);
const promiseTableNames = fetchTableNames();

const HOUR_SECONDS = 60 * 60;

type TProps = Partial<IStaticProps> & { affiliate: string };
export const getStaticProps: GetStaticProps<TProps> = async (context) => {
  const { params } = context;
  const { slug: maybeSlug } = params;
  const slug = Array.isArray(maybeSlug) ? maybeSlug[0] : maybeSlug;
  const defaultStaticProps = await getDefaultStaticProps(context);

  // check if slug is valid
  await promiseTableNames;
  const affiliate = await affiliateDao.getAffiliate(slug);

  if (!affiliate) {
    return {
      ...defaultStaticProps,
      redirect: {
        destination: "/presale-signup",
      },
      props: {
        ...("props" in defaultStaticProps ? defaultStaticProps.props : {}),
        affiliate: "",
      },
      revalidate: HOUR_SECONDS,
    };
  }
  return {
    ...defaultStaticProps,
    props: {
      ...("props" in defaultStaticProps ? defaultStaticProps.props : {}),
      affiliate: affiliate.address,
    },
    revalidate: HOUR_SECONDS,
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

const PresaleSignupPage: NextPage<TProps> = ({ i18n, affiliate, theme }) => {
  return (
    <DefaultProvider i18n={i18n} initialTheme={theme}>
      <Head>
        <title>Nameflick presale signup</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <PreSaleSignup affiliate={affiliate} />
    </DefaultProvider>
  );
};
export default PresaleSignupPage;
