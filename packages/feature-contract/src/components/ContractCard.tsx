import { FC, useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import { Field, Form, useFormikContext } from "formik";
import { ContractAddressInput } from "./ContractAddressInput";
import { ContractContent } from "./ContractContent";

import { OpenSeaCollection } from "../graphql/types";
import { IRegisterContract } from "../types";

export const ContractCard: FC<{
  collection?: OpenSeaCollection;
  collectionError?: Error;
  isERC721: boolean;
  isERC721CurrentlyLoading: boolean;
  erc721Error?: string;
}> = ({
  collection,
  collectionError,
  isERC721,
  isERC721CurrentlyLoading,
  erc721Error,
}) => {
  const { errors } = useFormikContext<IRegisterContract>();
  const [collectionExpanded, setCollectionExpanded] = useState(false);
  const toggleAccordion = useCallback(() => {
    setCollectionExpanded(!collectionExpanded);
  }, [collectionExpanded]);
  useEffect(() => {
    if (collection) {
      setCollectionExpanded(true);
    } else if (!collection || collectionError) {
      setCollectionExpanded(false);
    }
  }, [collection, collectionError]);

  const verified = isERC721;
  return (
    <Card
      sx={{
        height: "100%",
      }}
    >
      <CardHeader title="Select Contract" />
      <CardContent>
        <Form>
          <Field
            component={ContractAddressInput}
            type="text"
            label="NFT Contract Address"
            name="contractAddress"
            verified={verified}
            isERC721={isERC721}
            isERC721CurrentlyLoading={isERC721CurrentlyLoading}
            erc721Error={erc721Error}
          />
        </Form>
        <Accordion expanded={collectionExpanded}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            disabled={!collection}
            onClick={toggleAccordion}
          >
            <Typography>Contract Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ContractContent collection={collection} />
          </AccordionDetails>
        </Accordion>
      </CardContent>
      <CardActions></CardActions>
    </Card>
  );
};
