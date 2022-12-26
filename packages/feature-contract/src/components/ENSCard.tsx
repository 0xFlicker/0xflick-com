import { FC, useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import { Field, Form } from "formik";
import { ENSInput } from "./ENSInput";

export const ENSCard: FC<{}> = ({}) => {
  return (
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
            type="text"
            label="ENS Name"
            name="ensName"
          />
        </Form>
      </CardContent>
      <CardActions></CardActions>
    </Card>
  );
};
