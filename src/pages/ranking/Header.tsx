import {Box, Stack, Typography} from "@mui/material";
import {useAppContext} from "../../app/context";

const RankingHeader = () => {
  const {user, mobile} = useAppContext();
  const isAdmin = user?.role === "admin";

  return (
    <Stack direction="row" sx={{alignItems: "center"}}>
      <Box sx={{width: 30}} />
      <Stack
        direction={"row"}
        sx={{flex: 1, pl: "16px", pr: "26px", gap: 2, alignItems: "center"}}>
        <Typography
          variant="h6"
          align="center"
          sx={{
            width: 20,
          }}>
          #
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{flex: 1, minWidth: 180}}
          color="textPrimary">
          Giocatore
        </Typography>
        <Typography
          sx={{width: mobile ? 50 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "Pnt" : "Punti"}
        </Typography>
        <Typography
          sx={{width: mobile ? 50 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "G" : "Partite"}
        </Typography>
        <Typography
          sx={{width: mobile ? 50 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "V" : "Vittorie"}
        </Typography>
        <Typography
          sx={{width: mobile ? 50 : 100}}
          variant="body2"
          color="text.secondary"
          align="center">
          {mobile ? "S" : "Sconfitte"}
        </Typography>
        {isAdmin && <Box sx={{width: 40}} />}
      </Stack>
    </Stack>
  );
};

export {RankingHeader};
