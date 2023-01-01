import { FC } from "react";
import TextField from "@mui/material/TextField";
import { fieldToTextField, TextFieldProps } from "formik-mui";
import CheckCircle from "@mui/icons-material/CheckCircle";
import InputAdornment from "@mui/material/InputAdornment";
import Image from "next/image";

export const ENSInput: FC<
  TextFieldProps & {
    verified: boolean;
  }
> = ({ verified, ...props }) => {
  return (
    <TextField
      {...fieldToTextField(props)}
      margin="normal"
      fullWidth
      InputProps={{
        ...props.InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <Image
              src="/icons/ethereum-name-service-ens-logo.svg"
              width={32}
              height={32}
              alt=""
            />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {verified && <CheckCircle color="primary" />}
          </InputAdornment>
        ),
      }}
    />
  );
};
