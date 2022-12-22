import type { GetStaticProps } from "next";
import { TTheme } from "./types";
import { isTheme } from "./utils";

export const getStaticProps: GetStaticProps<{
  theme?: TTheme;
}> = async (context) => {
  const theme = Array.isArray(context.params?.theme)
    ? context.params.theme[0]
    : context.params?.theme;
  return {
    props: {
      ...(isTheme(theme) ? { theme } : {}),
    },
  };
};
