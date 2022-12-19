import { TextField } from "@mui/material";
import { FC, useCallback, useState } from "react";
import { utils } from "ethers";

export const ToAddressInput: FC<{
  handleAddress: (value: string) => void;
}> = ({ handleAddress }) => {
  const [isBad, setIsBad] = useState(false);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!utils.isAddress(e.target.value)) {
        handleAddress("");
        return setIsBad(true);
      }
      setIsBad(false);
      handleAddress(e.target.value);
    },
    [handleAddress]
  );
  return (
    <TextField
      label="To Address"
      required
      fullWidth
      error={isBad}
      variant="outlined"
      onChange={onChange}
    />
  );
};
