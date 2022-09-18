import Grid from "@mui/material/Grid";
import MenuList from "@mui/material/MenuList";
import { useLocale } from "locales/hooks";
import { FC } from "react";
import { Main } from "./Main";
import { useSavedTheme } from "features/appbar/hooks";
import { useMint } from "features/mint/hooks";
import { useHasAllowedAction } from "features/auth/hooks";
import { canPreSaleMint } from "features/auth/matchers";
import { ApprovalCard } from "features/mint/components/ApprovalCard";
import { PreSaleMintCard } from "features/mint";
import { SiteMenu } from "features/appbar/components/SiteMenu";

export const PreSaleMint: FC = () => {
  const { t } = useLocale(["mint", "common"]);
  const canPreSale = useHasAllowedAction(canPreSaleMint);
  useMint();
  const { handleChange: handleThemeChange } = useSavedTheme();
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <SiteMenu />
          </MenuList>
        </>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          {canPreSale ? <PreSaleMintCard /> : <ApprovalCard />}
        </Grid>
      </Grid>
    </Main>
  );
};
