import { FC } from "react";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";

import { useSavedTheme } from "../hooks";

export const DarkModeSwitch: FC = () => {
  const { isDarkMode, handleChange } = useSavedTheme();

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={isDarkMode} onChange={handleChange} />}
        label={isDarkMode ? "Dark" : "Light"}
      />
    </FormGroup>
  );
};
