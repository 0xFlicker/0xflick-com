import { FC } from "react";
import Image from "next/image";
import TextField from "@mui/material/TextField";
import { fieldToTextField, TextFieldProps } from "formik-mui";
import { InputAdornment } from "@mui/material";

export const EthereumAddressInput: FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...fieldToTextField(props)}
      margin="normal"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Image
              src={`/icons/ethereum-${isDarkMode ? "dark" : "light"}.svg`}
              alt=""
              width={32}
              height={32}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};
