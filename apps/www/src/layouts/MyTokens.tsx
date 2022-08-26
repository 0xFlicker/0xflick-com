import { FC } from "react";
import { Box, Container } from "@mui/material";
import { ResolverFormDemo } from "features/resolver/components/ResolverFormDemo";

export const MyTokens: FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignContent="center"
      height="100vh"
    >
      <Container maxWidth="sm">
        <ResolverFormDemo />
      </Container>
    </Box>
  );
};
