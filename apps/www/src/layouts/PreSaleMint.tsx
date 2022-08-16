import {
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { FancyModeSwitch } from "features/appbar/components/FancyModeSwitch";
import { useLocale } from "locales/hooks";
import { FC, useCallback, useState } from "react";
import { Main } from "./Main";
import { useSavedTheme } from "features/appbar/hooks";
import { useMint } from "features/mint/hooks";
import { useHasAllowedAction } from "features/auth/hooks";
import { canPreSaleMint } from "features/auth/matchers";
import { ApprovalCard } from "features/mint/components/ApprovalCard";
import { MintInfo } from "features/mint";

export const PreSaleMint: FC = () => {
  const { t } = useLocale(["mint"]);
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
                    {t("menu_theme")}
                  </Typography>
                }
              />
            </MenuItem>
          </MenuList>
        </>
      }
    >
      {canPreSale ? <MintInfo /> : <ApprovalCard />}
    </Main>
  );
};
