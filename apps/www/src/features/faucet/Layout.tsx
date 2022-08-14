import { FC } from "react";
import { Typography, Container, Paper, Box } from "@mui/material";
import { useLocale } from "locales/hooks";
import { ReCaptcha } from "./components/ReCaptcha";
import { Drink } from "./components/Drink";
import { ToAddressInput } from "./components/ToAddressInput";

export const Layout: FC = () => {
  const { t } = useLocale("common");
  return (
    <>
      <main>
        <Container>
          <Paper>
            <Box display="flex" justifyContent="center" sx={{ pt: 4 }}>
              <Typography variant="h5" component="h1" sx={{ pt: 4 }}>
                Free faucet, please be kind
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center">
              <Typography variant="body1" component="p" sx={{ pb: 4 }}>
                Provides {process.env.NEXT_PUBLIC_FAUCET_VALUE} for free every
                ~24 hours.
              </Typography>
            </Box>

            <Box display="flex" justifyContent="center">
              <ReCaptcha />
            </Box>
            <Box
              display="flex"
              justifyContent="center"
              sx={{ py: 2, px: 8, m: "auto" }}
            >
              <ToAddressInput />
            </Box>
            <Box display="flex" justifyContent="center" sx={{ pb: 4 }}>
              <Drink />
            </Box>
          </Paper>
        </Container>
      </main>
    </>
  );
};
