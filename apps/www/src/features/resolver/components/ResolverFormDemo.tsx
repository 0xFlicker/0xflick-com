import { FC } from "react";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { utils } from "ethers";
import { SubdomainInputForm } from "./SubdomainInputForm";
import { EthereumAddressInput } from "./EthereumAddressInput";
import { useSubmitPublicResolver } from "../graphql/useSubmitPublicResolver";
import { useAppDispatch } from "app/store";
import { actions as resolverActions } from "../redux";
import { EmailInputForm } from "./EmailInputForm";
import { CheckCircle } from "@mui/icons-material";

interface IValues {
  subdomain: string;
  addressEth: string;
  textRecordEmail: string;
}
export const ResolverFormDemo: FC = () => {
  const { submit, etherscan } = useSubmitPublicResolver();
  const dispatch = useAppDispatch();

  return (
    <>
      <Typography variant="h4" component="h4" gutterBottom>
        Nameflick public resolver
      </Typography>
      <Typography variant="h6" component="h6">
        Set any subdomain on *.public.nameflick.eth
      </Typography>
      <Typography variant="h6" component="h6" gutterBottom>
        instantly, gassless and free
      </Typography>
      <Formik
        initialValues={{
          subdomain: "",
          addressEth: "",
          textRecordEmail: "",
        }}
        validate={(values: IValues) => {
          const errors: Partial<IValues> = {};
          if (!values.subdomain) {
            errors.subdomain = "Required";
          }
          if (!values.addressEth) {
            errors.addressEth = "Required";
          } else if (!utils.isAddress(values.addressEth)) {
            errors.addressEth = "Invalid address";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          submit({
            variables: {
              addressEth: values.addressEth,
              domain: `${values.subdomain}.public.nameflick.eth`,
              textRecordEmail: values.textRecordEmail,
            },
          }).then(() => {
            setSubmitting(false);
            dispatch(resolverActions.close());
          });
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form>
            <Field
              component={SubdomainInputForm}
              name="subdomain"
              type="text"
              label="subdomain"
            />
            <br />
            <Field
              component={EthereumAddressInput}
              type="text"
              label="ETH"
              name="addressEth"
            />
            <br />
            <Field
              component={EmailInputForm}
              type="email"
              label="email"
              name="textRecordEmail"
              width="100%"
            />
            <LinearProgress
              sx={{
                opacity: isSubmitting ? 1 : 0,
              }}
            />
            <br />
            <Button
              variant="contained"
              color="primary"
              sx={{
                mt: 2,
              }}
              disabled={isSubmitting}
              onClick={submitForm}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
      {etherscan ? (
        <Box textAlign="center">
          <a href={etherscan} target="_blank" rel="noopener noreferrer">
            See it on etherscan
          </a>
        </Box>
      ) : (
        <br />
      )}
    </>
  );
};
