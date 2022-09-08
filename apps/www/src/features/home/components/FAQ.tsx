import { FC, ReactNode } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Typography,
} from "@mui/material";

const QA: FC<{ question: ReactNode; answer: ReactNode }> = ({
  question,
  answer,
}) => (
  <Accordion>
    <AccordionSummary>
      <Typography variant="h6">{question}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography>{answer}</Typography>
    </AccordionDetails>
  </Accordion>
);

export const FAQ: FC = () => {
  return (
    <>
      <Typography sx={{ mt: 4 }} variant="h3" component="h3" gutterBottom>
        Frequently Asked Questions
      </Typography>
      <Card>
        <QA
          question="What is Nameflick"
          answer="Nameflick is an NFT wrapper for ENS domains that gives ENS domains superpowers"
        />
        <QA
          question="What are these superpowers?"
          answer="ENS allows custom resolvers to be set to respond to external requests for data from an ENS domain. Nameflick is both an NFT and a custom ENS resolver. The ENS customer resolver works with a set of web services to enable secure, instant, and gasless updates of most ENS data."
        />
        <QA
          question="How does gasless updates of ENS work?"
          answer={
            <>
              Recent improvements proposed by ENS and EF have enabled innovate
              new ways to resolve ENS requests. These include&nbsp;
              <a
                href="https://docs.ens.domains/ens-improvement-proposals/ensip-10-wildcard-resolution"
                target="_blank"
                rel="noreferrer noopener"
              >
                ENSIP-10
              </a>
              &nbsp;(Wildcard resolution) and&nbsp;
              <a
                href="https://eips.ethereum.org/EIPS/eip-3668"
                target="_blank"
                rel="noreferrer noopener"
              >
                EIP-3668
              </a>
              &nbsp;(Offchain data lookup). Nameflick uses these features to
              enable instant and gasless updates of ENS data.
            </>
          }
        />
      </Card>
      <Typography sx={{ mt: 4 }}>
        More to come here, please check back later...
      </Typography>
    </>
  );
};
