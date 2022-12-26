import { FC } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Web from "@mui/icons-material/Web";
import Twitter from "@mui/icons-material/Twitter";
import Telegram from "@mui/icons-material/Telegram";
import Button from "@mui/material/Button";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";
import { DiscordIcon } from "@0xflick/components/src/DiscordIcon";
import { OpenSeaCollection } from "../graphql/types";

export const ContractContent: FC<{
  collection?: OpenSeaCollection;
}> = ({ collection }) => {
  const {
    name,
    description,
    externalUrl,
    imageUrl,
    discordUrl,
    twitterUsername,
    telegramUrl,
  } = collection || {};
  return collection ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        mt: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            mt: 2,
          }}
        >
          <Typography variant="h5" component="h1">
            {name}
          </Typography>
        </Box>
        {imageUrl && <img src={imageUrl} alt={name} height={128} width={128} />}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            mt: 2,
          }}
        >
          <Typography variant="body1" component="p">
            {description}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            mt: 2,
          }}
        >
          {externalUrl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <Button
                LinkComponent={WrappedLink}
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                startIcon={<Web />}
              >
                Website
              </Button>
            </Box>
          )}
          {twitterUsername && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <Button
                LinkComponent={WrappedLink}
                href={`https://twitter.com/${twitterUsername}`}
                target="_blank"
                rel="noreferrer"
                startIcon={<Twitter />}
              >
                Twitter
              </Button>
            </Box>
          )}
          {telegramUrl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <Button
                LinkComponent={WrappedLink}
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                startIcon={<Telegram />}
              >
                Telegram
              </Button>
            </Box>
          )}
          {discordUrl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
                mr: 2,
              }}
            >
              <Button
                LinkComponent={WrappedLink}
                href={discordUrl}
                target="_blank"
                rel="noreferrer"
              >
                <DiscordIcon />
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  ) : (
    <Box
      height="240px"
      sx={{
        mt: 2,
      }}
    />
  );
};
