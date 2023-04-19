import { FC, ReactNode } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

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
      <Card>
        <QA
          question="What is wrapping?"
          answer="Wrapping is a process of exchanging one token for another. In this case, you are exchanging one Fame Lady Squad NFT for a Fame Lady Society NFT."
        />
        <QA
          question="What is the Fame Lady Society?"
          answer="The Fame Lady Society is a community of NFT collectors and creators that are passionate about the Fame Lady Squad NFTs. However, the community no longer has access to the smart contract that created the Fame Lady Squad NFTs. The Fame Lady Society seeks to regain access to the smart contract and continue operating as a community owned and operated NFT project."
        />
        <QA
          question="What happens to my NFT when I wrap it?"
          answer="When you wrap your Fame Lady Squad NFT, you will deposit it into the Fame Lady Society smart contract. You will receive a Fame Lady Society NFT in return. The Fame Lady Society NFT is a 1:1 representation of your Fame Lady Squad NFT. While the original Fame Lady Squad NFT is wrapped, it is owned by the Fame Lady Society smart contract and can no longer be moved or sold. You can then use your Fame Lady Society NFT to participate in the Fame Lady Society community."
        />
        <QA
          question="Can I unwrap my Fame Lady Society NFT?"
          answer="Yes, you can unwrap your Fame Lady Society NFT at any time. When you unwrap your Fame Lady Society NFT, you will relinquish ownership of the Fame Lady Society NFT and receive the original Fame Lady Squad NFT in return. The Fame Lady Squad NFT is a 1:1 representation of your Fame Lady Society NFT."
        />
        <QA
          question="Why should I wrap my Fame Lady Squad NFT?"
          answer="Wrapping your Fame Lady Squad NFT will allow you to continue participating in the Fame Lady Squad community. The Fame Lady Squad community is no longer active and the smart contract that created the Fame Lady Squad NFTs is no longer accessible. Wrapping your Fame Lady Squad NFT will allow you to continue participating in the Fame Lady Society community. In addition the Fame Lady Society smart contract, being a modern and efficient smart contract will guarantee royalty enforcement and enable gas efficient transfers compared to the Fame Lady Squad smart contract."
        />
        <QA
          question="What if I want to transfer my Fame Lady Society NFT to another address after I wrap it?"
          answer="While wrapping, you will have the option to send the new Fame Lady Society NFT to a different address than the address that currently holds the Fame Lady Squad token. This was you can save gas and transfer the wrapped token to a different address, for example a ledger wallet."
        />
        <QA
          question="What will the governance structure of the Fame Lady Society be?"
          answer="The Fame Lady Society will be governed by the Fame Lady Society NFT holders. The Fame Lady Society NFT holders will be able to vote on proposals to drive the community forward and make decisions on how the Fame Lady Society will operate."
        />
      </Card>
    </>
  );
};

export default FAQ;
