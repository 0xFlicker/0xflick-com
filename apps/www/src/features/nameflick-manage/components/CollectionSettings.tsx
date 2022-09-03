import { FC, forwardRef, Ref } from "react";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import { useFormik } from "formik";

import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import { CheckboxWithLabel, CheckboxWithLabelProps } from "formik-mui";
import { INameflickTokenSettings } from "@0xflick/models";
import { utils } from "ethers";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type TValues = {
  enableNft: boolean;
  contractAddress: string;
  tokenSubDomains: boolean;
  tokenSubDomainsContractEditable: boolean;
  tokenSubDomainsOwnerEditable: boolean;
  claimableSubDomains: boolean;
};

const defaultValues = (token: INameflickTokenSettings): TValues => ({
  enableNft: token.enableNft ?? false,
  contractAddress: token.contractAddress ?? "",
  tokenSubDomains: token.tokenSubDomains ?? false,
  tokenSubDomainsContractEditable:
    token.tokenSubDomainsContractEditable ?? false,
  tokenSubDomainsOwnerEditable: token.tokenSubDomainsOwnerEditable ?? false,
  claimableSubDomains: token.claimableSubDomains ?? false,
});

// const ChecboxLabelWithTooltip: FC<TextFieldProps> = (props) => {
//   return (
//     <TextField
//       {...fieldToTextField(props)}
//       margin="normal"
//       fullWidth
//       helperText="Optional"
//       InputProps={{
//         startAdornment: (
//           <InputAdornment position="start">
//             <Email />
//           </InputAdornment>
//         ),
//       }}
//     />
//   );
// };

const CheckboxLabelWithTooltip = (tooltipProps: TooltipProps) => {
  return forwardRef<HTMLButtonElement, CheckboxWithLabelProps>(
    function InnerRef(props, ref) {
      return (
        <Tooltip {...tooltipProps}>
          <CheckboxWithLabel {...props} ref={ref} />
        </Tooltip>
      );
    }
  );
};

// const TooltipForwardRef = forwardRef(function TooltipInnerRef(_, ref) {
//   return (
//     <Tooltip title="Enable NFT collection support for this ENS">
//       <Field
//         ref={ref}
//         type="checkbox"
//         component={CheckboxWithLabel}
//         name="enableNft"
//         Label={{
//           label: "Enable NFT Support",
//         }}
//       />
//     </Tooltip>
//   );
// });
export const CollectionDetails: FC<{
  ens: string;
  settings?: INameflickTokenSettings;
}> = ({ settings, ens }) => {
  const { values, handleChange, handleReset } = useFormik({
    initialValues: defaultValues(settings ?? {}),
    validate: (values: TValues) => {
      const errors: Partial<TValues> = {};
      if (values.enableNft) {
        if (!values.contractAddress) {
          errors.contractAddress = "Required";
        } else if (!utils.isAddress(values.contractAddress)) {
          errors.contractAddress = "Invalid address";
        }
      }
      return errors;
    },
    onSubmit: (values, { setSubmitting }) => {
      // nothing
      setTimeout(() => setSubmitting(false), 500);
    },
  });
  return (
    <Paper elevation={2}>
      <Container maxWidth="lg">
        <Typography variant="h5" component="h1" gutterBottom sx={{ pt: 2 }}>
          ENS settings
        </Typography>

        <Box margin={2} py={2}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
            }}
          >
            <FormControl component="fieldset" style={{ display: "flex" }}>
              <Tooltip title="Enable NFT collection support for this ENS">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.enableNft}
                      onChange={handleChange}
                      name="enableNft"
                      color="primary"
                    />
                  }
                  label="Enable NFT Support"
                />
              </Tooltip>
              <Divider />
              <Box mx={2}>
                <FormGroup>
                  <Tooltip
                    title={`Enable automatic token number subdomains. For example, token number 555 will automatically be granted 555.${ens}`}
                  >
                    <FormControlLabel
                      disabled={!values.enableNft}
                      control={
                        <Checkbox
                          checked={values.tokenSubDomains}
                          onChange={handleChange}
                          name="tokenSubDomains"
                          color="primary"
                        />
                      }
                      label="Token # subdomains"
                    />
                  </Tooltip>
                  <Tooltip title="Allow NFT holders to claim subdomains for their tokens">
                    <FormControlLabel
                      disabled={!values.enableNft}
                      control={
                        <Checkbox
                          checked={values.claimableSubDomains}
                          onChange={handleChange}
                          name="claimableSubDomains"
                          color="primary"
                        />
                      }
                      label="Claimable"
                    />
                  </Tooltip>
                </FormGroup>
              </Box>
            </FormControl>
          </Paper>
        </Box>
        <Box display="flex" my={2} pb={2}>
          <Button variant="contained" color="primary">
            Save
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleReset}
            sx={{ ml: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </Container>
    </Paper>
  );
};
