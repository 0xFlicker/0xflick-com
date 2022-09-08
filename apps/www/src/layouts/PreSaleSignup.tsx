import Container from "@mui/material/Container";
import Grid2 from "@mui/material/Unstable_Grid2";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { useLocale } from "locales/hooks";
import { FC } from "react";
import { Main } from "./Main";
import { useSavedTheme } from "features/appbar/hooks";
import { useMint } from "features/mint/hooks";
import { useHasAllowedAction } from "features/auth/hooks";
import { canPreSaleMint } from "features/auth/matchers";
import { ApprovalCard } from "features/mint/components/ApprovalCard";
import { PreSaleMintCard } from "features/mint";
import { TokenDescription } from "../features/mint/components/TokenDescription";

export const PreSaleSignup: FC<{ affiliate?: string }> = ({ affiliate }) => {
  const { t } = useLocale(["mint", "common"]);
  const canPreSale = useHasAllowedAction(canPreSaleMint);
  useMint();
  const { handleChange: handleThemeChange } = useSavedTheme();
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <MenuItem onClick={handleThemeChange}>
              <DarkModeSwitch />
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
          {t("presale_signup_title", { ns: "common" })}
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
        </Grid2>
      </Container>
    </Main>
  );
};
