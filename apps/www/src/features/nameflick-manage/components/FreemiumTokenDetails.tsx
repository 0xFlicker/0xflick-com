import { FC, ReactNode, SyntheticEvent, useCallback, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import {
  INameflick,
  INameflickToken,
  subdomainFromEnsName,
} from "@0xflick/models";
import { RecordUpdate } from "./RecordUpdate";
import { RecordCreate, TValues } from "./RecordCreate";
import { utils } from "ethers";

const Record: FC<{
  summary: ReactNode;
  content: (onCancel: () => void) => ReactNode;
}> = ({ summary, content }) => {
  const [open, setOpen] = useState(false);
  const onChange = useCallback((event: SyntheticEvent, expanded: boolean) => {
    setOpen(expanded);
  }, []);
  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);
  return (
    <Accordion expanded={open} onChange={onChange}>
      <AccordionSummary>
        <Typography variant="h6">{summary}</Typography>
      </AccordionSummary>
      <AccordionDetails>{content(onCancel)}</AccordionDetails>
    </Accordion>
  );
};

export const FreemiumTokenDetails: FC<{
  token?: INameflickToken;
}> = ({ token }) => {
  const domain = token?.metadata?.wrappedEns ?? "unknown";
  const [mockedRecords, setMockedRecords] = useState(
    Object.entries(token?.metadata?.records ?? {})
  );
  const [newRecord, setNewRecord] = useState(false);
  const onAddNewRecord = useCallback(() => {
    setNewRecord(true);
  }, []);
  const onNewRecord = useCallback(
    (value: TValues) => {
      setMockedRecords((records) => [
        ...records,
        [
          value.subdomain,
          {
            normalized: `${value.subdomain}.${domain}`,
            ensHash: utils.namehash(`${value.subdomain}.${domain}`),
            addresses: {
              eth: value.addressEth,
            },
            textRecord: {
              email: value.textRecordEmail,
            },
          },
        ],
      ]);
      setNewRecord(false);
    },
    [domain]
  );
  const onDelete = useCallback(
    (nameflick: INameflick) => {
      const subdomain = subdomainFromEnsName(nameflick.normalized ?? "");
      setMockedRecords((records) =>
        records.filter(([key]) => key !== subdomain)
      );
    },
    [setMockedRecords]
  );
  const onCreateCancel = useCallback(() => {
    setNewRecord(false);
  }, [setNewRecord]);
  return (
    <>
      <Typography variant="h4" component="h4" gutterBottom>
        {domain}
      </Typography>
      {mockedRecords.map(([key, value]) => (
        <Record
          key={key}
          summary={key}
          content={(onCancel) => (
            <RecordUpdate
              nameflick={{
                ensHash: key,
                normalized: value.normalized,
                addresses: value.addresses,
                textRecord: value.textRecord,
              }}
              onDelete={onDelete}
              onCancel={onCancel}
            />
          )}
        />
      ))}
      {newRecord ? (
        <RecordCreate
          domain={domain}
          onCreate={onNewRecord}
          onCancel={onCreateCancel}
        />
      ) : (
        <IconButton
          aria-label="add subdomain"
          color="primary"
          onClick={onAddNewRecord}
        >
          <AddIcon />
        </IconButton>
      )}
    </>
  );
};
