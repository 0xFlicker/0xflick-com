import { FC, useCallback, useEffect } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Box,
} from "@mui/material";
import NextImage from "next/image";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectors as appbarSelectors,
  actions as appbarActions,
} from "features/appbar/redux";
import { Connect } from "features/web3";
import { ETheme, useSavedTheme } from "../hooks";

export const AppBar: FC = () => {
  const isDarkMode = useAppSelector(appbarSelectors.darkMode);
  const [theme, setTheme] = useSavedTheme();
  useEffect(() => {
    if (theme && (theme === ETheme.DARK) !== isDarkMode) {
      dispatch(appbarActions.setDarkMode(theme === ETheme.DARK));
    }
  });
  const dispatch = useAppDispatch();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isDarkModeSelected = event.target.checked;
      setTheme(isDarkModeSelected ? ETheme.DARK : ETheme.LIGHT);
    },
    [setTheme]
  );
  return (
    <MuiAppBar color="default">
      <Toolbar>
        <Box component="div" sx={{ mx: 2 }}>
          <NextImage src="/flick.png" width={40} height={40} />
        </Box>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          0xflick
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={<Switch checked={isDarkMode} onChange={handleChange} />}
            label={isDarkMode ? "Dark" : "Light"}
          />
        </FormGroup>
        <Connect />
      </Toolbar>
    </MuiAppBar>
  );
};
