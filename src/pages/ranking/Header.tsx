import {Box, Stack, Typography, type SxProps} from "@mui/material";
import {useAppContext} from "../../app/context";
import type {Theme} from "@emotion/react";

const RankingHeader = ({sx}: {sx?: SxProps<Theme>}) => {
  const {mobile} = useAppContext();

  return (
    <Stack direction="row" sx={{alignItems: "center", ...sx}}>
      <Box sx={{minWidth: 30}} />
      <Stack
        direction={"row"}
        sx={{
          flex: 1,
          pl: mobile ? 0 : "16px",
          pr: mobile ? 0 : "26px",
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
          sx={{width: mobile ? 25 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "Pnt" : "Punti"}
        </Typography>
        <Typography
          sx={{width: mobile ? 25 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "G" : "Partite"}
        </Typography>
        <Typography
          sx={{width: mobile ? 25 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "V" : "Vittorie"}
        </Typography>
        <Typography
          sx={{width: mobile ? 25 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "S" : "Sconfitte"}
        </Typography>
        <Box sx={{width: 16}} />
      </Stack>
    </Stack>
  );
};

export {RankingHeader};
