import { FC } from "react";
import { Box, Container } from "@mui/material";
import { ListNameflickManage } from "features/nameflick-manage/components/List";

export const MyTokens: FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignContent="center"
      height="100vh"
    >
      <Container maxWidth="lg">
        <ListNameflickManage />
      </Container>
    </Box>
  );
};
