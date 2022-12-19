import { FC, useCallback } from "react";
import { Button, LinearProgress, IconButton, Box } from "@mui/material";
import TrashIcon from "@mui/icons-material/Delete";
import { Formik, Form, Field } from "formik";
import { utils } from "ethers";
import { EmailInputForm } from "@0xflick/components/src/forms/EmailInputForm";
import { EthereumAddressInput } from "@0xflick/components/src/forms/EthereumAddressInput";
import { INameflick, subdomainFromEnsName } from "@0xflick/models";

type TValues = {
  addressEth: string;
  textRecordEmail: string;
};

function nameflickToValues(nameflick: INameflick) {
  return {
    subdomain: nameflick.normalized
      ? subdomainFromEnsName(nameflick.normalized)
      : "",
    addressEth: nameflick.addresses?.eth || "",
    textRecordEmail: nameflick.textRecord?.email || "",
  };
}
export const RecordUpdate: FC<{
  nameflick: INameflick;
  onDelete: (nameflick: INameflick) => void;
  onCancel: () => void;
}> = ({ nameflick, onDelete, onCancel }) => {
  const onClickDelete = useCallback(
    () => onDelete(nameflick),
    [nameflick, onDelete]
  );
  return (
    <>
      <Formik
        initialValues={nameflickToValues(nameflick)}
        validate={(values: TValues) => {
          const errors: Partial<TValues> = {};
          if (!values.addressEth) {
            errors.addressEth = "Required";
          } else if (!utils.isAddress(values.addressEth)) {
            errors.addressEth = "Invalid address";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          // nothing
          setTimeout(() => setSubmitting(false), 500);
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form>
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
                Submit
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ ml: 2 }}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Box ml={2} flexGrow={1}></Box>
              <IconButton onClick={onClickDelete}>
                <TrashIcon />
              </IconButton>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};
