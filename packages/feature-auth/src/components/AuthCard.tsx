import { FC } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { useLocale } from "@0xflick/feature-locale";
import { useAuth } from "../hooks";

export const AuthCard: FC = () => {
  const { t } = useLocale("common");
  const { signIn, signOut, isAuthenticated, isAnonymous } = useAuth();
  return (
    <Card>
      <CardHeader
        title={t("auth_card_title")}
        subheader={isAuthenticated ? t("auth_logged_in") : t("auth_logged_out")}
      ></CardHeader>
      <CardContent>
        <Typography variant="body1">
          {isAuthenticated
            ? t("auth_logged_in_description")
            : t("auth_logged_out_description")}
        </Typography>
      </CardContent>
      <CardActions>
        {isAnonymous && (
          <Button variant="contained" color="primary" onClick={signIn}>
            {t("auth_button_login")}
          </Button>
        )}
        {isAuthenticated && (
          <>
            <Button variant="contained" color="primary" onClick={signOut}>
              {t("auth_button_logout")}
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
};
