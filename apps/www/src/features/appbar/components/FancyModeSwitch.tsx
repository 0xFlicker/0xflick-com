import { FC, useEffect, useCallback } from "react";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectors as appbarSelectors,
  actions as appbarActions,
} from "features/appbar/redux";

import { ETheme, useFancyMode, useSavedTheme } from "../hooks";

export const FancyModeSwitch: FC = () => {
  const isFancyMode = useAppSelector(appbarSelectors.fancyMode);
  const [savedFancyMode, setFancyMode] = useFancyMode();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (savedFancyMode !== isFancyMode) {
      dispatch(appbarActions.setFancyMode(savedFancyMode));
    }
  }, [dispatch, savedFancyMode, isFancyMode]);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isFancyModeSelected = event.target.checked;
      setFancyMode(isFancyModeSelected);
    },
    [setFancyMode]
  );
  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={isFancyMode} onChange={handleChange} />}
        label={isFancyMode ? "3D" : "Flat"}
      />
    </FormGroup>
  );
};
