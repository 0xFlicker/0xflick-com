import { FC } from "react";
import TextField from "@mui/material/TextField";
import { fieldToTextField, TextFieldProps } from "formik-mui";

export const TokenID: FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...fieldToTextField(props)}
      margin="normal"
      fullWidth
      helperText="Token ID"
    />
  );
};
