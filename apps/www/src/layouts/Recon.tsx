import { ListItemText, MenuItem, MenuList, Typography } from "@mui/material";
import { FancyModeSwitch } from "features/appbar/components/FancyModeSwitch";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import { Main } from "./Main";
export const Recon: FC = () => {
  const { t } = useLocale("common");

  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <MenuItem>
              <FancyModeSwitch />
              <ListItemText
                primary={
                  <Typography textAlign="right" flexGrow={1}>
                    {t("menu_fancy")}
                  </Typography>
                }
              />
            </MenuItem>
          </MenuList>
        </>
      }
    >
      <iframe
        width="100%"
        height="100%"
        src="https://main.d1cstwm7mdpz8a.amplifyapp.com/75"
      />
    </Main>
  );
};
