import { useLocale } from "@0xflick/feature-locale/src/hooks";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import MuiToolbar from "@mui/material/Toolbar";

export function Toolbar() {
  const { t } = useLocale("common");
  return (
    <>
      <MuiAppBar color="default">
        <MuiToolbar>
          <Typography variant="h5" component="h1">
            {t("title_faq")}
          </Typography>
          <Box sx={{ flexGrow: 1 }} component="span" />
        </MuiToolbar>
      </MuiAppBar>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}></Box>
      </Container>
    </>
  );
}
