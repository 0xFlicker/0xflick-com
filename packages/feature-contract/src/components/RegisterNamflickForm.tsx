import { FC } from "react";
import { Field, Form, Formik, FormikHelpers, useFormikContext } from "formik";
import { EthereumAddressInput } from "./EthereumAddressInput";
import { ContractAddressInput } from "./ContractAddressInput";

export const RegisterNameflickFormContent: FC = () => {
  const { values, setFieldValue } = useFormikContext();
  return (
    <Form>
      <Field
        component={EthereumAddressInput}
        disabled={state.status !== "idle"}
        type="text"
        label="Royalties Address"
        name="royaltiesAddress"
      />
    </Form>
  );
};

export const RegisterNameflickForm: FC = () => {
  return (
    <Formik
      initialValues={{
        contractAddress: "",
        ensName: "",
      }}
    >
      <RegisterNameflickFormContent />
    </Formik>
  );
};
