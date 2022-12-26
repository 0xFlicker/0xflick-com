import {
  FC,
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import DocumentScannerOutlined from "@mui/icons-material/DocumentScannerOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { fieldToTextField, TextFieldProps } from "formik-mui";
import { StatusField } from "@0xflick/components/src/StatusField";

/**
 * Popover to show the contract status, below and centered on the contract address
 * input adornment.
 */
const ContractStatusPopOverContents: FC<{
  isERC721: boolean;
  isERC721CurrentlyLoading: boolean;
  erc721Error?: string;
}> = ({ isERC721, isERC721CurrentlyLoading, erc721Error }) => {
  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          p: 2,
        }}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
        >
          <StatusField
            checked={isERC721}
            currentlyLoading={isERC721CurrentlyLoading}
          >
            {isERC721 ? "Valid ERC721" : erc721Error || "Not ERC721"}
          </StatusField>
        </Box>
      </Box>
    </>
  );
};

export const ContractAddressInput: FC<
  TextFieldProps & {
    verified?: boolean;
    isERC721: boolean;
    isERC721CurrentlyLoading: boolean;
    erc721Error?: string;
  }
> = ({
  verified,
  isERC721,
  isERC721CurrentlyLoading,
  erc721Error,
  ...props
}) => {
  const adornmentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const doClose = useCallback(() => {
    setOpen(false);
  }, []);
  const onClick: MouseEventHandler = useCallback((event) => {
    setOpen(true);
  }, []);

  return (
    <>
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
          // endAdornment: (
          //   <InputAdornment ref={adornmentRef} position="end">
          //     {verified && (
          //       <IconButton onClick={onClick} aria-details="contract details">
          //         <CheckCircle color="primary" />
          //       </IconButton>
          //     )}
          //   </InputAdornment>
          // ),
        }}
      />
      {adornmentRef.current && (
        <Popover
          open={open}
          anchorEl={adornmentRef.current}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          onClose={doClose}
        >
          <ContractStatusPopOverContents
            isERC721={isERC721}
            isERC721CurrentlyLoading={isERC721CurrentlyLoading}
            erc721Error={erc721Error}
          />
        </Popover>
      )}
    </>
  );
};
