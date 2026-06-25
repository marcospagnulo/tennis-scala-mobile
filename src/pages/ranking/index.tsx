import {
  Backdrop,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  type SxProps,
} from "@mui/material";
import type {Player} from "../../domain/types";
import {useAppContext} from "../../app/context";
import type {Theme} from "@emotion/react";
import {useState} from "react";
import {PlayerList} from "./player-list";
import {RankingHeader} from "./Header";
import {useAddPlayers} from "../../functions/ranking/useAddPlayers";
import {AddIcon} from "../../icons";
import {useRanking} from "../../functions";
import {InfoBox} from "../../components";
import {RankingGroup} from "./Group";
import {CanManageSeason} from "../../components/CanManageSeason";

const RankingPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const [dialog, setDialog] = useState<boolean>(false);
  const [mode, setMode] = useState<"compact" | "expanded">("compact");
  const [live, setLive] = useState<boolean>(false);

  const {currentSeason, mobile} = useAppContext();
  const {loading, addPlayers} = useAddPlayers();
  const {rankingGroups, minPlayers, loading: rankingLoading} = useRanking(live);

  const handleAddPlayers = async (players: Player[]) => {
    setDialog(false);
    if (!currentSeason) return;
    await addPlayers(currentSeason, players);
  };

  return (
    <Stack sx={{...sx, ...(!mobile && {pb: 2}), pt: 2}}>
      {!minPlayers && !rankingLoading && (
        <InfoBox
          sx={{
            ...(mobile && {mx: 2}),
          }}
          invert
          message="Non è stato raggiunto il numero minimo di 16 iscritti"
        />
      )}

      <Paper sx={{display: "flex", flex: "1 1 0"}} elevation={mobile ? 0 : 1}>
        {rankingLoading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack
            sx={{
              gap: 1,
              flex: "1 1 0",
              overflow: "hidden",
            }}>
            <Stack
              direction={"row"}
              sx={{
                alignItems: "center",
                gap: 2,
                ...(mobile && {px: 2}),
              }}>
              <Stack direction={"row"} sx={{alignItems: "center"}}>
                <Typography>Live</Typography>
                <Switch
                  disabled={!currentSeason?.periods?.find(p => !p.end)}
                  checked={live}
                  onChange={() => setLive(prev => !prev)}
                />
              </Stack>
              <Stack direction={"row"} sx={{alignItems: "center"}}>
                <Typography>Compatta</Typography>
                <Switch
                  checked={mode === "compact"}
                  onChange={() =>
                    setMode(prev =>
                      prev === "compact" ? "expanded" : "compact",
                    )
                  }
                />
              </Stack>

              <CanManageSeason>
                <IconButton
                  size="small"
                  onClick={() => setDialog(true)}
                  sx={{
                    ml: "auto",
                    "&, &:hover": {
                      backgroundColor: theme => theme.palette.primary.main,
                    },
                  }}>
                  <AddIcon fontSize="inherit" sx={{color: "white"}} />
                </IconButton>
              </CanManageSeason>
            </Stack>
            <Stack
              sx={{
                overflow: "auto",
                flex: "1 1 0",
                ...(mobile && {pb: 6}),
              }}>
              <RankingHeader
                mode={mode}
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  bgcolor: "background.paper",
                }}
              />
              <Divider
                sx={{borderColor: theme => theme.palette.primary.main}}
              />
              <RankingGroup
                group={rankingGroups[1]}
                gindex={1}
                mode={mode}
                live={live}
              />
              <Divider
                sx={{borderColor: theme => theme.palette.primary.main}}
              />
              <RankingGroup
                group={rankingGroups[2]}
                gindex={2}
                mode={mode}
                live={live}
              />
              <Divider
                sx={{borderColor: theme => theme.palette.primary.main}}
              />
              <RankingGroup
                group={rankingGroups[3]}
                gindex={3}
                mode={mode}
                live={live}
              />
              <Divider
                sx={{borderColor: theme => theme.palette.primary.main}}
              />
              <RankingGroup
                group={rankingGroups[4]}
                gindex={4}
                mode={mode}
                live={live}
              />
            </Stack>
          </Stack>
        )}
      </Paper>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        fullWidth
        maxWidth="sm">
        <DialogTitle>Seleziona giocatore</DialogTitle>
        <DialogContent>
          <PlayerList onSelect={handleAddPlayers} sx={{height: "70vh"}} />
        </DialogContent>
      </Dialog>

      <Backdrop open={loading} sx={{zIndex: theme => theme.zIndex.drawer + 1}}>
        <CircularProgress />
      </Backdrop>
    </Stack>
  );
};

export {RankingPage};
