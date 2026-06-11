import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  useTheme,
  type SxProps,
} from "@mui/material";
import type {Player} from "../../domain/types";
import {useAppContext} from "../../app/context";
import type {Theme} from "@emotion/react";
import {RankingRow} from "./row";
import {useState} from "react";
import {PlayerList} from "./player-list";
import {RankingHeader} from "./Header";
import {useAddPlayers} from "../../functions/ranking/useAddPlayers";
import {AddIcon, RankingIcon} from "../../icons";
import {useRanking} from "../../functions";
import type {rankingGroupsType} from "../../functions/useRanking";
import {Admin} from "../../components";

const RankingPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const [dialog, setDialog] = useState<boolean>(false);
  const [mode, setMode] = useState<"compact" | "expanded">("compact");
  const [live, setLive] = useState<boolean>(false);

  const theme = useTheme();
  const {player, currentSeason, mobile} = useAppContext();
  const {loading, addPlayers} = useAddPlayers();
  const {
    challengeableRange,
    rankingPlayer,
    rankingGroups,
    validRanking,
    liveRanking,
  } = useRanking(live);

  const handleAddPlayers = async (players: Player[]) => {
    setDialog(false);
    if (!currentSeason) return;
    await addPlayers(currentSeason, players);
  };

  const getRankingBgColor = (
    index: number,
    playerId: string,
    length: number,
    groupIndex: number,
  ) => {
    const color =
      player?.id === playerId
        ? theme.palette.secondary.main
        : theme.palette.primary.main;

    const alternate = groupIndex % 2 === 0;
    const compare = alternate
      ? (a: number, b: number) => a < b
      : (a: number, b: number) => a >= b;
    return compare(index, length / 2) ? color + "10" : color + "20";
  };

  const renderGroup = (
    rankingGroupsType: rankingGroupsType,
    gindex: 1 | 2 | 3 | 4,
    mode: "compact" | "expanded",
  ) => {
    const group = rankingGroupsType[gindex];
    if (group.length === 0) return null;

    return (
      <Stack direction={"row"}>
        <Stack
          sx={{minWidth: 30, justifyContent: "center", alignItems: "center"}}>
          <Typography variant="h5">{gindex}</Typography>
        </Stack>
        <Stack sx={{flex: 1}} divider={<Divider />}>
          {group.map((r, index) => {
            let challengablePosition = false;
            const samePlayer = r.player.id === player?.id;
            if (
              challengeableRange &&
              challengeableRange.length === 2 &&
              rankingPlayer
            ) {
              challengablePosition =
                r.position >= challengeableRange[0] &&
                r.position <= challengeableRange[1];
            }
            return (
              <RankingRow
                key={`ranking-${r.position}`}
                ranking={r}
                challengeable={!samePlayer && challengablePosition}
                divider={(index + 1) % group.length === 0 && gindex !== 4}
                liveRanking={
                  live
                    ? undefined
                    : liveRanking.find(lr => lr.player.id === r.player.id)
                }
                mode={mode}
                bgColor={getRankingBgColor(
                  index,
                  r.player.id!,
                  group.length,
                  gindex,
                )}
              />
            );
          })}
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack sx={{...sx, ...(!mobile && {pb: 2}), pt: 2}}>
      <Stack
        direction={"row"}
        sx={{
          alignItems: "center",
          mb: 2,
          gap: 2,
          ...(mobile && {px: 2}),
        }}>
        <FormControlLabel
          control={
            <Switch checked={live} onChange={() => setLive(prev => !prev)} />
          }
          label="Live"
        />
        <FormControlLabel
          control={
            <Switch
              checked={mode === "compact"}
              onChange={() =>
                setMode(prev => (prev === "compact" ? "expanded" : "compact"))
              }
            />
          }
          label="Compatta"
        />

        <Admin>
          <IconButton
            onClick={() => setDialog(true)}
            sx={{
              ml: "auto",
              "&, &:hover": {
                backgroundColor: theme => theme.palette.primary.main,
              },
            }}>
            <AddIcon fontSize="inherit" sx={{color: "white"}} />
          </IconButton>
        </Admin>
      </Stack>
      {validRanking ? (
        <Paper sx={{display: "flex", flex: "1 1 0"}} elevation={mobile ? 0 : 1}>
          <Stack
            sx={{
              gap: 1,
              flex: "1 1 0",
              overflow: "hidden",
            }}>
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
              <Stack>{renderGroup(rankingGroups, 1, mode)}</Stack>
              <Stack>{renderGroup(rankingGroups, 2, mode)}</Stack>
              <Stack>{renderGroup(rankingGroups, 3, mode)}</Stack>
              <Stack>{renderGroup(rankingGroups, 4, mode)}</Stack>
            </Stack>
          </Stack>
        </Paper>
      ) : (
        <Stack
          sx={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}>
          <RankingIcon color="primary" sx={{fontSize: 180}} />
          <Typography variant="h5">Classifica non disponibile</Typography>
        </Stack>
      )}
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
