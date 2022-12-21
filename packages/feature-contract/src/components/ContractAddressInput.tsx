import { FC } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import DocumentScannerOutlined from "@mui/icons-material/DocumentScannerOutlined";
import { fieldToTextField, TextFieldProps } from "formik-mui";

export const ContractAddressInput: FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...fieldToTextField(props)}
      margin="normal"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <DocumentScannerOutlined />
          </InputAdornment>
        ),
      }}
    />
  );
};
