import { FC } from "react";

import Card from "@mui/material/Card";
import CardTitle from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export const UnwrapCard: FC = () => {
  return (
    <Card>
      <CardTitle title="Unwrap" />
      <CardContent>
        <Typography variant="body2" component="p">
          Coming soon
        </Typography>
      </CardContent>
    </Card>
  );
};
