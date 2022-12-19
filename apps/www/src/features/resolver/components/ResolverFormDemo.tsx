import { FC } from "react";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { utils } from "ethers";
import { useSubmitPublicResolver } from "../graphql/useSubmitPublicResolver";
import { EmailInputForm } from "@0xflick/components/src/forms/EmailInputForm";
import { SubdomainInputForm } from "@0xflick/components/src/forms/SubdomainInputForm";
import { EthereumAddressInput } from "@0xflick/components/src/forms/EthereumAddressInput";

interface IValues {
  subdomain: string;
  addressEth: string;
  textRecordEmail: string;
}
const SubDomainComponent = SubdomainInputForm("public.nameflick.eth");
export const ResolverFormDemo: FC<{ onDone: () => void }> = ({ onDone }) => {
  const { submit, etherscan } = useSubmitPublicResolver();

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
            onDone();
          });
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form>
            <Field
              component={SubDomainComponent}
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
