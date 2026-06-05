import {Box, Stack, Typography, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import type {Theme} from "@emotion/react";

const RankingHeader = ({
  sx,
  mode,
}: {
  sx?: SxProps<Theme>;
  mode: "compact" | "expanded";
}) => {
  const {mobile} = useAppContext();

  return (
    <Stack direction="row" sx={{alignItems: "center", ...sx}}>
      <Box sx={{minWidth: 30}} />
      <Stack
        direction={"row"}
        sx={{
          flex: 1,
          py: 1,
          px: mobile ? 0 : 2,
          gap: mobile ? 1 : 2,
          alignItems: "center",
        }}>
        <Typography
          variant="h6"
          align="center"
          sx={{
            width: 20,
          }}>
          #
        </Typography>
        <Typography variant="subtitle1" color="textPrimary">
          Giocatore
        </Typography>
        <Box sx={{flex: 1}} />
        <Typography
          sx={{width: mobile ? 80 : 120}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "Pnt" : "Punti"}
        </Typography>
        <Typography
          sx={{width: mobile ? 25 : 70}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "G" : "Partite"}
        </Typography>
        {mode === "expanded" && (
          <>
            <Typography
              sx={{width: mobile ? 25 : 70}}
              variant="body2"
              color="text.secondary"
              align="center">
              {mobile ? "V" : "Vittorie"}
            </Typography>
            <Typography
              sx={{width: mobile ? 25 : 70}}
              variant="body2"
              color="text.secondary"
              align="center">
              {mobile ? "Par" : "Pareggi"}
            </Typography>
            <Typography
              sx={{width: mobile ? 25 : 70}}
              variant="body2"
              color="text.secondary"
              align="center">
              {mobile ? "S" : "Sconfitte"}
            </Typography>
          </>
        )}
        <Box sx={{width: 8}} />
      </Stack>
    </Stack>
  );
};

export {RankingHeader};
