import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { FC } from "react";
import { Main } from "./Main";
import { useLocale } from "locales/hooks";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { UserStatus } from "features/user/components/UserStatus";
import { SiteMenu } from "features/appbar/components/SiteMenu";

export const ProfileLayout: FC = () => {
  const { t } = useLocale(["common"]);
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <SiteMenu />
          </MenuList>
        </>
      }
      title={
        <Typography variant="h5" component="h1">
          {t("title_profile")}
        </Typography>
      }
    >
      <Container
        maxWidth={false}
        sx={{
          mt: 4,
        }}
      >
        <Box
          sx={{
            ml: 4,
            mt: 4,
          }}
        >
          <UserStatus />
        </Box>
      </Container>
    </Main>
  );
};
