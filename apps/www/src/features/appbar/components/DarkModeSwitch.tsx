import { FC, useEffect, useCallback } from "react";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectors as appbarSelectors,
  actions as appbarActions,
} from "features/appbar/redux";

import { ETheme, useSavedTheme } from "../hooks";

export const DarkModeSwitch: FC = () => {
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
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={isDarkMode} onChange={handleChange} />}
        label={isDarkMode ? "Dark" : "Light"}
      />
    </FormGroup>
  );
};
