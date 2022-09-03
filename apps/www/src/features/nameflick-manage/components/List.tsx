import { FC } from "react";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Grid,
  CardMedia,
  Typography,
} from "@mui/material";
import { useAppSelector } from "app/store";
import { selectors as nameflickSelectors } from "../redux";
import { tokenToUrl, tokenToStatusDescription } from "../utils";
import { FlickLink } from "components/FlickLink";

export const ListNameflickManage: FC = () => {
  const ownedTokens = useAppSelector(nameflickSelectors.ownedTokens);

  return (
    <Grid container spacing={2}>
      {ownedTokens.map((token) => (
        <Grid item xs={12} sm={12} md={6} lg={4} key={token.tokenId}>
          <Card variant="elevation" sx={{ maxWidth: 345 }}>
            <CardMedia component="img" image={tokenToUrl(token)} />
            <CardContent
              sx={{
                minHeight: 100,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {tokenToStatusDescription(token?.metadata?.status)}
              </Typography>
            </CardContent>
            <CardActions>
              <FlickLink
                href={`/nameflick/${token.tokenId}`}
                variant="body1"
                underline="hover"
                sx={{ textTransform: "uppercase" }}
              >
                edit
              </FlickLink>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
