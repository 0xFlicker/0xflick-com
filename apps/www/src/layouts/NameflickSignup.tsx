import Container from "@mui/material/Container";
import Grid2 from "@mui/material/Unstable_Grid2";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { FC } from "react";
import { Main } from "./Main";
import { useTheme } from "@0xflick/feature-theme";
import { useMint } from "features/mint/hooks";
import { useHasAllowedAction } from "features/auth/hooks";
import { SiteMenu } from "features/appbar/components/SiteMenu";
import { useLocale } from "@0xflick/feature-locale";

export const PreSaleSignup: FC<{ affiliate?: string }> = ({ affiliate }) => {
  const { t } = useLocale(["common"]);
  const canPreSale = useHasAllowedAction(canPreSaleMint);
  useMint();
  const { toggleTheme: handleThemeChange } = useTheme();
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <MenuItem onClick={handleThemeChange}>
              <SiteMenu />
              <ListItemText
                primary={
                  <Typography textAlign="right" flexGrow={1}>
                    {t("menu_theme", { ns: "common" })}
                  </Typography>
                }
              />
            </MenuItem>
          </MenuList>
        </>
      }
      title={
        <Typography variant="h5" component="h1">
          {t("title_presale_signup", { ns: "common" })}
        </Typography>
      }
    >
      <Container
        maxWidth="xl"
        sx={{
          mt: 4,
        }}
      >
        <Grid2 container spacing={2}>
          <Grid2 xs={12} lg={6}>
            <TokenDescription />
          </Grid2>
          <Grid2 xs={12} lg={6}>
            {canPreSale ? (
              <PreSaleMintCard />
            ) : (
              <ApprovalCard affiliate={affiliate} />
            )}
          </Grid2>
          {canPreSale && (
            <Grid2 xs={12} lg={6}>
              <PresaleWhatNextCard />
            </Grid2>
          )}
        </Grid2>
      </Container>
    </Main>
  );
};
