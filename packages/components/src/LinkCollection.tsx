import Grid2 from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import { LinkCard } from "./LinkCard";

const defaultCardMediaProps = {
  component: "img",
  height: "240",
  sx: {
    objectFit: "contain",
    px: 2,
  },
};
const defaultGridBreakpoints = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 3,
  xl: 2,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const LinkCollection: FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  const { t } = useLocale(["common"]);
  return (
    <Grid2 container spacing={4}>
      {/* <Grid2 {...defaultGridBreakpoints}>
        <LinkCard
          headerTitle="demo"
          content={
            <Typography color="text.secondary" sx={{ height: 80 }}>
              Instant ENS resolution demo
            </Typography>
          }
          CardMediaProps={{
            ...defaultCardMediaProps,
            image: `/marketing/demo-${isDarkMode ? "dark" : "light"}.png`,
          }}
          to="/demo"
        />
      </Grid2> */}
      {/* <Grid2 {...defaultGridBreakpoints}>
        <LinkCard
          headerTitle="signup for nameflick"
          content={
            <Typography color="text.secondary" sx={{ height: 80 }}>
              Sign up for Nameflick
            </Typography>
          }
          CardMediaProps={{
            ...defaultCardMediaProps,
            image: `/marketing/presale-signup-${
              isDarkMode ? "dark" : "light"
            }.png`,
          }}
          to="/signup/premint/from-links"
        />
      </Grid2> */}
      <Grid2 {...defaultGridBreakpoints}>
        <LinkCard
          headerTitle="open source: GitHub"
          content={
            <Typography color="text.secondary" sx={{ height: 80 }}>
              Look at what&apos;s under the hood
            </Typography>
          }
          CardMediaProps={{
            ...defaultCardMediaProps,
            image: `/marketing/github-${isDarkMode ? "dark" : "light"}.png`,
          }}
          to="https://github.com/nameflick"
        />
      </Grid2>
      <Grid2 {...defaultGridBreakpoints}>
        <LinkCard
          headerTitle="social: Twitter"
          content={
            <Typography color="text.secondary" sx={{ height: 80 }}>
              Official Twitter account
            </Typography>
          }
          CardMediaProps={{
            ...defaultCardMediaProps,
            image: `/marketing/twitter-${isDarkMode ? "dark" : "light"}.png`,
          }}
          to="https://twitter.com/NameflickENS"
        />
      </Grid2>
      <Grid2 {...defaultGridBreakpoints}>
        <LinkCard
          headerTitle="social: NftyChat"
          content={
            <Typography color="text.secondary" sx={{ height: 80 }}>
              Preferred social community because of its ENS first and native
              web3 support
            </Typography>
          }
          CardMediaProps={{
            ...defaultCardMediaProps,
            image: `/flick.png`,
          }}
          to="https://nftychat.xyz/community/7193783"
        />
      </Grid2>
      <Grid2 {...defaultGridBreakpoints}>
        <LinkCard
          headerTitle="social: Discord"
          content={
            <Typography color="text.secondary" sx={{ height: 80 }}>
              Discord because that&apos;s where people are
            </Typography>
          }
          CardMediaProps={{
            ...defaultCardMediaProps,
            image: `/marketing/discord-${isDarkMode ? "dark" : "light"}.png`,
          }}
          to="https://discord.gg/GE3zFDU8aU"
        />
      </Grid2>
      <Grid2 {...defaultGridBreakpoints}>
        <LinkCard
          headerTitle="FAQ"
          content={
            <Typography color="text.secondary" sx={{ height: 80 }}>
              Frequently asked questions
            </Typography>
          }
          CardMediaProps={{
            ...defaultCardMediaProps,
            image: `/marketing/faq-${isDarkMode ? "dark" : "light"}.png`,
          }}
          to="/faq"
        />
      </Grid2>
    </Grid2>
  );
};
