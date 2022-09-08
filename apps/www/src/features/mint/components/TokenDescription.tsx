import { FC } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export const TokenDescription: FC = () => {
  return (
    <Card variant="elevation">
      <CardHeader title="Presale sign-up" />
      <CardContent>
        <Typography gutterBottom>
          This is a presale sign-up for the upcoming NFT drop of Nameflick.
          Nameflick is an ENS utility token that gives your ENS superpowers via
          a frontend web UI and a backend API.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography gutterBottom>
          Add, create, update and sub-divide your ENS domains with Nameflick.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography gutterBottom>
          <b>Nameflick will be a free mint</b>
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography gutterBottom>
          Mint date and count are <b>TBD</b>
        </Typography>
      </CardContent>
    </Card>
  );
};
