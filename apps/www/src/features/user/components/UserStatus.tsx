import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Unstable_Grid2";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CopyIcon from "@mui/icons-material/ContentCopyRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import { useLocale } from "@0xflick/feature-locale";
import { useAuth } from "@0xflick/feature-auth/src/hooks";
import { StatusField } from "@0xflick/components/src/StatusField";
import {
  useIsFollowingQuery,
  useLazyIsFollowingQuery,
} from "features/twitter/api";
import { LoginWithTwitterButton } from "features/twitter/components/LoginWithTwitterButton";
import { CopyToClipboardButton } from "features/faucet/components/CopyToClipboard";
import { useManageAffiliates } from "features/affiliates/hooks/useManageAffiliates";
import Chip from "@mui/material/Chip";
import {
  useWeb3,
  selectors as web3Selectors,
  Connect,
} from "@0xflick/feature-web3";
import { useAppSelector } from "@0xflick/app-store";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";

const MIN_HEIGHT = 320;
const UserLoginCard: FC = () => {
  const { t } = useLocale(["user", "common"]);
  const isWeb3Connected = useAppSelector(web3Selectors.isConnected);
  const {
    isAuthenticated,
    isUserWaiting,
    isUserSigningMessage,
    signIn,
    signOut,
    savedToken,
  } = useAuth();
  return (
    <Card
      variant="elevation"
      sx={{
        minHeight: MIN_HEIGHT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader title={t("user_panel_title")} />
      <Box sx={{ flexGrow: 1 }} />
      <CardContent>
        <Box display="flex" flexDirection="row" marginLeft={2}>
          <StatusField
            currentlyLoading={isUserWaiting && isUserSigningMessage}
            checked={isAuthenticated}
          >
            {isAuthenticated
              ? t("user_auth_logged_in")
              : t("user_auth_not_logged_in")}
          </StatusField>
        </Box>
        <Box display="flex" flexDirection="row" marginTop={4}>
          <Typography variant="body1" component="p">
            {!isAuthenticated ? t("user_auth_login_cta") : " "}
          </Typography>
        </Box>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
      <CardActions>
        {!isWeb3Connected && <Connect size="small" />}
        {isWeb3Connected && !isAuthenticated && (
          <Button size="small" onClick={signIn}>
            {t("user_auth_login")}
          </Button>
        )}
        {isWeb3Connected && isAuthenticated && (
          <Button size="small" onClick={signOut}>
            {t("user_auth_logout")}
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {isAuthenticated && savedToken && (
          <CopyToClipboardButton
            text={savedToken}
            ButtonProps={{ endIcon: <CopyIcon />, size: "small" }}
          >
            {t("user_auth_copy_token")}
          </CopyToClipboardButton>
        )}
      </CardActions>
    </Card>
  );
};

const UserStatusTwitter: FC<{}> = () => {
  const { t } = useLocale("user");
  const { isAuthenticated } = useAuth();
  const [
    fetchIsFollowing,
    { isError, isFetching, isLoading, isSuccess, data, isUninitialized },
  ] = useLazyIsFollowingQuery();
  useEffect(() => {
    if (isAuthenticated) {
      fetchIsFollowing();
    }
  }, [fetchIsFollowing, isAuthenticated]);
  const needsLogin = isSuccess && "needsLogin" in data && data.needsLogin;
  const isCurrentlyLoading = isLoading || isFetching;
  return (
    <Card
      variant="elevation"
      sx={{
        minHeight: MIN_HEIGHT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader title={t("user_twitter_panel_title")} />
      <Box sx={{ flexGrow: 1 }} />
      <CardContent>
        <Box display="flex" flexDirection="row" marginLeft={2}>
          <StatusField
            currentlyLoading={isCurrentlyLoading}
            checked={!isCurrentlyLoading && !isError && !needsLogin}
          >
            {t("user_twitter_connected")}
          </StatusField>
        </Box>
        <Box display="flex" flexDirection="row" marginTop={4}>
          <Typography variant="body1" component="p">
            {!isAuthenticated ? t("user_twitter_not_logged_in") : " "}
            {needsLogin && isAuthenticated ? t("user_twitter_login_cta") : " "}
          </Typography>
        </Box>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
      <CardActions>
        {needsLogin && <LoginWithTwitterButton disabled={!isAuthenticated} />}
      </CardActions>
    </Card>
  );
};

const SlugItem: FC<{
  slug: string;
  handleClick: (slug: string) => void;
  handleClose: (slug: string) => void;
}> = ({ slug, handleClose, handleClick }) => {
  const { t } = useLocale("user");
  const onDelete = useCallback(() => {
    handleClose(slug);
  }, [slug, handleClose]);
  const onClick = useCallback(() => {
    handleClick(slug);
  }, [slug, handleClick]);
  return (
    <Grid2>
      <Chip label={slug} onDelete={onDelete} onClick={onClick} />
    </Grid2>
  );
};

const SlugList: FC<{
  slugs?: string[];
  disabled?: boolean;
  onClick: (slug: string) => void;
  handleClose: (slug: string) => void;
  addSlug: () => void;
}> = ({ addSlug, disabled, slugs, handleClose, onClick }) => {
  return (
    <Grid2 container spacing={2}>
      {slugs?.map((slug) => (
        <SlugItem
          key={slug}
          slug={slug}
          handleClose={handleClose}
          handleClick={onClick}
        />
      ))}
      <Grid2>
        <IconButton size="small" onClick={addSlug} disabled={disabled}>
          <AddIcon />
        </IconButton>
      </Grid2>
    </Grid2>
  );
};

const UserStatusAffiliates: FC<{}> = () => {
  const { selectedAddress } = useWeb3();
  const { isAuthenticated } = useAuth();
  const {
    createSlug,
    createdRoleName,
    deactivateSlug,
    enroll,
    isAffiliate,
    count,
    slugs,
  } = useManageAffiliates();
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<ReactNode>(null);

  const { t } = useLocale("user");

  useEffect(() => {
    if (createdRoleName) {
      setSnackbarMessage(t("user_affiliate_created"));
      setOpen(true);
    }
  }, [createdRoleName, t]);

  const addSlug = useCallback(() => {
    if (selectedAddress) {
      createSlug({ address: selectedAddress });
    }
  }, [createSlug, selectedAddress]);

  const deleteSlug = useCallback(
    (slug: string) => {
      if (selectedAddress) {
        deactivateSlug({ address: selectedAddress, slug });
      }
    },
    [deactivateSlug, selectedAddress]
  );

  const createAffiliate = useCallback(() => {
    if (selectedAddress) {
      enroll({ address: selectedAddress });
    }
  }, [enroll, selectedAddress]);

  const onClick = useCallback(
    (slug: string) => {
      const link = `${window.origin}/presale-signup/${slug}`;
      window.navigator.clipboard.writeText(link);
      setSnackbarMessage(
        <WrappedLink href={`/presale-signup/${slug}`}>
          <Typography variant="body1" component="p">
            {t("user_affiliate_copy-n-paste", {
              link,
              interpolation: { escapeValue: false },
            })}
          </Typography>
        </WrappedLink>
      );
      setOpen(true);
    },
    [t]
  );
  return (
    <>
      <Card
        variant="elevation"
        sx={{
          minHeight: MIN_HEIGHT,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader title={t("user_affiliates_panel_title")} />
        <Box sx={{ flexGrow: 1 }} />
        <CardContent>
          <Typography variant="body1" component="p" gutterBottom>
            {t("user_affiliates_panel_description")}
          </Typography>
          <Typography variant="body1" component="p">
            {t("user_affiliates_panel_count", {
              addressCount: count,
              count: count,
            })}
          </Typography>
        </CardContent>
        <CardContent>
          <Typography
            color={!isAffiliate ? "text.disabled" : "text.secondary"}
            variant="body1"
            component="p"
            gutterBottom
          >
            {t("user_affiliates_panel_description_2")}
          </Typography>
          <SlugList
            slugs={slugs}
            disabled={!isAffiliate}
            addSlug={addSlug}
            handleClose={deleteSlug}
            onClick={onClick}
          />
          <Snackbar
            open={open}
            color="success"
            onClose={() => setOpen(false)}
            autoHideDuration={10000}
            message={snackbarMessage}
          />
        </CardContent>
        <Box sx={{ flexGrow: 1 }} />
        <CardActions>
          {!isAffiliate && (
            <Button
              size="small"
              onClick={createAffiliate}
              disabled={!isAuthenticated}
            >
              {t("user_affiliates_enroll")}
            </Button>
          )}
        </CardActions>
      </Card>
    </>
  );
};

// const UserStatusAffiliates: FC<{}> = () => {
//   // const { t } = useLocale("user");
//   const {
//     createSlug,
//     createdRoleName,
//     deactivateSlug,
//     enroll,
//     isAffiliate,
//     slugs,
//   } = useManageAffiliates();
//   return (
//     <Box display="flex" flexDirection="row">
//       <Button variant="contained" color="primary" onClick={onLogin}>
//         {t("user_affiliate_enroll")}
//       </Button>
//       <Typography variant="h6" gutterBottom>
//         {t("user_affiliate_cta")}
//       </Typography>
//     </Box>
//   );
// };

const UserJoinPremint: FC<{
  onLogin: () => void;
}> = ({ onLogin }) => {
  const { t } = useLocale("user");
  return (
    <Box display="flex" flexDirection="row">
      <Button variant="contained" color="primary" onClick={onLogin}>
        {t("user_premint_join")}
      </Button>
      <Typography variant="h6" gutterBottom>
        {t("user_prmemint_cta")}
      </Typography>
    </Box>
  );
};

/**
 * Component for displaying the user's status.
 * Shows the following:
 *  - User's logged in status
 *
 *  If the user is logged in, shows the following:
 *  - User's address
 *  - User's twitter connected status
 *  - Presale status
 *  - Affiliate status
 */
export const UserStatus: FC<{}> = () => {
  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={12} sm={12} md={6} lg={4}>
        <UserLoginCard />
      </Grid2>
      <Grid2 xs={12} sm={12} md={6} lg={4}>
        <UserStatusTwitter />
      </Grid2>
      <Grid2 xs={12} sm={12} md={6} lg={4}>
        <UserStatusAffiliates />
      </Grid2>
    </Grid2>
  );
};
