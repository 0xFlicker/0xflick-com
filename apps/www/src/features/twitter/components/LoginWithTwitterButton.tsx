import { FC } from "react";
import { Button } from "@mui/material";
import { Twitter as TwitterIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useLocale } from "locales/hooks";

export const LoginWithTwitterButton: FC<{ disabled?: boolean }> = ({
  disabled,
}) => {
  const router = useRouter();
  const { t } = useLocale("common");
  return (
    <Button
      variant="contained"
      color="primary"
      disabled={disabled}
      startIcon={<TwitterIcon />}
      href={`/api/auth/twitter-login-v1?redirectUri=${encodeURIComponent(
        router.asPath
      )}`}
    >
      {t("button_twitter_login")}
    </Button>
  );
};
