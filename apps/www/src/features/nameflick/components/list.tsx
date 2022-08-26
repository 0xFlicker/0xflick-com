import { FC } from "react";
import { Box,Card, CardContent, CardActions, CardHeader, Grid } from "@mui/material";
import { useAppSelector } from "app/store";
import { selectors as nameflickSelectors } from "features/nameflick-manage/redux";

export const ListNameflickManage: FC = () => {
  const ownedTokens = useAppSelector(nameflickSelectors.ownedTokens);

  return (
    <Grid container spacing={2}>

      {ownedTokens.map((token) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={token.tokenId}>

          <Card variant="elevation">
            <CardHeader title={`#${token.tokenId}`} />
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                

};
