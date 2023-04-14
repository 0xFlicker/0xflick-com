import { FC, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ReactCountDown from "react-countdown";

const END_DATE = new Date("2023-04-21T00:00:00.000Z");

export const CountDown: FC = () => {
  const [start, setStart] = useState(false);
  useEffect(() => {
    setStart(true);
  }, []);
  return start ? (
    <ReactCountDown
      date={END_DATE}
      renderer={({ days, hours, minutes, seconds }) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h1" component="span" color="text.primary">
              {days}
            </Typography>
            <Typography
              variant="h5"
              component="span"
              marginLeft={2}
              color="text.primary"
            >
              Days
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }} marginLeft={2}>
            <Typography variant="h1" component="span" color="text.primary">
              {hours}
            </Typography>
            <Typography
              variant="h5"
              component="span"
              marginLeft={2}
              color="text.primary"
            >
              Hours
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }} marginLeft={2}>
            <Typography variant="h1" component="span" color="text.primary">
              {minutes}
            </Typography>
            <Typography
              variant="h5"
              component="span"
              marginLeft={2}
              color="text.primary"
            >
              Minutes
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }} marginLeft={2}>
            <Typography variant="h1" component="span" color="text.primary">
              {seconds}
            </Typography>
            <Typography
              variant="h5"
              component="span"
              marginLeft={2}
              color="text.primary"
            >
              Seconds
            </Typography>
          </Box>
        </Box>
      )}
    />
  ) : null;
};
