import { FC } from "react";

import Card from "@mui/material/Card";
import CardTitle from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { goerli, useAccount } from "wagmi";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";
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
          Coming soon. If you want to unwrap now, you can call the unwrap method
          directly on{" "}
          <WrappedLink
            href="https://etherscan.io/address/0x6cf4328f1ea83b5d592474f9fcdc714faafd1574#writeContract#F18"
            target="_blank"
            rel="noopener noreferrer"
          >
            etherscan
          </WrappedLink>
        </Typography>
      </CardContent>
    </Card>
  ) : null;
};
