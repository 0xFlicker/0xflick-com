import type { GetServerSideProps } from "next";
import { TTheme } from "./types";
import { isTheme } from "./utils";

export const getServerSideProps: GetServerSideProps<{
  theme?: TTheme;
}> = async (context) => {
  const theme = context.req.cookies.theme;
  return {
    props: {
      ...(isTheme(theme) ? { theme } : {}),
    },
  };
};
