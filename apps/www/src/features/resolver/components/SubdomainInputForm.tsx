import { FC } from "react";
import TextField from "@mui/material/TextField";
import { fieldToTextField, TextFieldProps } from "formik-mui";
import { InputAdornment } from "@mui/material";
import { NetworkPing } from "@mui/icons-material";

export const SubdomainInputForm: FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...fieldToTextField(props)}
      margin="normal"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <NetworkPing />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">.public.nameflick.eth</InputAdornment>
        ),
      }}
    />
  );
};
