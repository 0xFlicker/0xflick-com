import { FC } from "react";
import TextField from "@mui/material/TextField";
import { fieldToTextField, TextFieldProps } from "formik-mui";
import InputAdornment from "@mui/material/InputAdornment";
import Image from "next/image";
import SvgIcon from "@mui/material/SvgIcon";

export const ENSInput: FC<TextFieldProps> = (props) => {
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
      }}
    />
  );
};
