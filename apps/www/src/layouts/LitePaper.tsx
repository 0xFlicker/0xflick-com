import { FC } from "react";
import { Box, Container } from "@mui/material";
import { LitePaperMarkdown } from "features/home/components/LitePaperMarkdown";

export const LitePaper: FC = () => {
  return (
    <Box
      sx={{
        mt: 4,
      }}
    >
      <LitePaperMarkdown />
    </Box>
  );
};
