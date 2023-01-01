import { FC, useCallback, useEffect, useState } from "react";
import { useFormikContext } from "formik";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import CircularProgress from "@mui/material/CircularProgress";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";
import { Field, Form } from "formik";
import { ENSInput } from "./ENSInput";
import { useEnsAccountIsApproved } from "../wagmi/useEnsAccountIsApproved";
import { IRegisterContract } from "../types";
import { useEnsReclaim } from "../wagmi/useEnsReclaim";

export const ENSCard: FC<{
  pushToast: (message: string) => void;
}> = ({ pushToast }) => {
  const { values } = useFormikContext<IRegisterContract>();
  const { isApprovedOrOwner, recordExists, refetch } = useEnsAccountIsApproved(
    values.ensName
  );
  const {
    isSuccess: reclaimIsSuccess,
    isLoading: reclaimIsLoading,
    write,
  } = useEnsReclaim(values.ensName);

  useEffect(() => {
    if (reclaimIsSuccess) {
      pushToast && pushToast("ENS reclaimed");
      refetch();
    }
  }, [reclaimIsSuccess, pushToast, refetch]);

  return (
    <>
      <Card
        sx={{
          height: "100%",
        }}
      >
        <CardHeader title="Select ENS" />
        <CardContent>
          <Form>
            <Field
              component={ENSInput}
              verified={isApprovedOrOwner}
              type="text"
              label="ENS Name"
              name="ensName"
            />
          </Form>
        </CardContent>
        <CardActions>
          {values.ensName.length > 0 &&
            values.ensName.endsWith(".eth") &&
            !recordExists && <Button variant="contained">Register</Button>}
          {recordExists && !isApprovedOrOwner && (
            <Button
              variant="contained"
              startIcon={
                reclaimIsLoading ? <CircularProgress size={20} /> : null
              }
              disabled={reclaimIsLoading}
              onClick={() => write && write()}
            >
              Claim
            </Button>
          )}
        </CardActions>
      </Card>
    </>
  );
};
