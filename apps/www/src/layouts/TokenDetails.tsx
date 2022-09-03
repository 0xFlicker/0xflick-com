import { FC } from "react";
import { Box, Container } from "@mui/material";
import { INameflickToken } from "@0xflick/models";
import { FreemiumTokenDetails } from "features/nameflick-manage/components/FreemiumTokenDetails";
import { CollectionTokenDetails } from "features/nameflick-manage/components/CollectionTokenDetails";
import { PersonalTokenDetails } from "features/nameflick-manage/components/PersonalTokenDetails";

export const TokenDetails: FC<{ token?: INameflickToken }> = ({ token }) => {
  return (
    <Box marginTop={4}>
      <Container maxWidth="lg">
        {(() => {
          switch (token?.metadata?.status) {
            case "FREE_USE":
              return <FreemiumTokenDetails token={token} />;
            case "PERSONAL_USE":
              return <PersonalTokenDetails token={token} />;
            case "COMMUNITY_USE":
              return <CollectionTokenDetails token={token} />;
            default:
              return null;
          }
        })()}
      </Container>
    </Box>
  );
};
