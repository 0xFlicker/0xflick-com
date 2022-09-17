import { FC } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import { WrappedLink } from "components/WrappedLink";

export const PresaleWhatNextCard: FC = () => {
  return (
    <Card>
      <CardHeader title="What's next?" />
      <CardContent>
        <Typography variant="body1" component="p">
          Check out your <WrappedLink href="/profile">profile</WrappedLink> to
          create your very own affiliate links!
        </Typography>
      </CardContent>
    </Card>
  );
};
