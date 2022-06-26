import { GetStaticProps, NextPage } from "next";
import { Nfts } from "layouts/Nfts";
import { DefaultProvider } from "context/default";
import nftCollection from "fixtures/nft-collection";
import { INfts } from "models/nfts";

interface IPageProps {
  serverSideNfts?: INfts[];
}
export const getStaticProps: GetStaticProps<IPageProps> = () => {
  return {
    props: {
      serverSideNfts: nftCollection,
    },
  };
};

const Page: NextPage<IPageProps> = ({ serverSideNfts }) => {
  return (
    <DefaultProvider>
      <Nfts serverSideNfts={serverSideNfts} />
    </DefaultProvider>
  );
};

export default Page;
