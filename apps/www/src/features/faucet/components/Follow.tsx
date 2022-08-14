import { FC, useEffect } from "react";
import Head from "next/head";

export const Follow: FC = () => {
  return (
    <>
      <a
        href={`https://twitter.com/${process.env.NEXT_PUBLIC_TWITTER_FOLLOW_NAME}?ref_src=twsrc%5Etfw`}
        className="twitter-follow-button"
        data-show-count="false"
      >
        {`Follow ${process.env.NEXT_PUBLIC_TWITTER_FOLLOW_NAME}`}
      </a>
    </>
  );
};
