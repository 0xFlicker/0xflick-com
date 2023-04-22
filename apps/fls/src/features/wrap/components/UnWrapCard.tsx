import { FC } from "react";

import Card from "@mui/material/Card";
import CardTitle from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { goerli, useAccount } from "wagmi";
import { useWeb3 } from "@0xflick/feature-web3";

export const UnwrapCard: FC<{
  testnetOnly?: boolean;
}> = ({ testnetOnly = false }) => {
  const { isConnected } = useAccount();
  const { currentChain } = useWeb3();

  return isConnected &&
    ((testnetOnly && currentChain.id === goerli.id) || !testnetOnly) ? (
    <Card>
      <CardTitle title="Unwrap" />
      <CardContent>
        <Typography variant="body2" component="p">
          Coming soon
        </Typography>
      </CardContent>
    </Card>
  ) : null;
};
