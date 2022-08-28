import { FC } from "react";
import { Box, Container } from "@mui/material";
import { INameflickToken } from "@0xflick/models";
import { FreemiumTokenDetails } from "features/nameflick-manage/components/FreemiumTokenDetails";

export const TokenDetails: FC<{ token?: INameflickToken }> = ({ token }) => {
  return (
    <Box marginTop={4}>
      <Container maxWidth="lg">
        <FreemiumTokenDetails token={token} />
      </Container>
    </Box>
  );
};
