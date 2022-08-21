import { FC } from "react";
import { Box, Container } from "@mui/material";
import { FAQ } from "features/home/components/FAQ";

export const Faq: FC = () => {
  return (
    <Container maxWidth="xl">
      <FAQ />
    </Container>
  );
};
