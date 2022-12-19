import { FC, useMemo } from "react";
import { Box, Button, LinearProgress } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { utils } from "ethers";
import { EmailInputForm } from "@0xflick/components/src/forms/EmailInputForm";
import { SubdomainInputForm } from "@0xflick/components/src/forms/SubdomainInputForm";
import { EthereumAddressInput } from "@0xflick/components/src/forms/EthereumAddressInput";
import {
  INameflick,
  subdomainFromEnsName,
  rootFromEnsName,
} from "@0xflick/models";

export type TValues = {
  subdomain: string;
  addressEth: string;
  textRecordEmail: string;
};

export const RecordCreate: FC<{
  domain: string;
  onCreate: (values: TValues) => void;
  onCancel: () => void;
}> = ({ domain, onCreate, onCancel }) => {
  const SubDomainComponent = useMemo(
    () => SubdomainInputForm(domain),
    [domain]
  );
  return (
    <>
      <Formik
        initialValues={{
          subdomain: "",
          addressEth: "",
          textRecordEmail: "",
        }}
        validate={(values: TValues) => {
          const errors: Partial<TValues> = {};
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
          setTimeout(() => {
            onCreate(values);
            setSubmitting(false);
          }, 500);
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
            <Box display="flex" mt={2}>
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={submitForm}
              >
                Create
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={isSubmitting}
                sx={{ ml: 2 }}
                onClick={onCancel}
              >
                Cancel
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};
