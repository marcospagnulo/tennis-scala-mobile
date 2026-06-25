import {
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {useAppContext} from "./context";
import {SeasonIcon} from "../icons";
import dayjs from "dayjs";
import {ConfirmDialog, InfoBox} from "../components";
import {useEffect, useState} from "react";
import {useAddPlayers} from "../functions/ranking/useAddPlayers";
import {Select} from "../components/Select";
import {useRanking} from "../functions";
import {SportsTennis, UnfoldLess, UnfoldMore} from "@mui/icons-material";
import {useLocation} from "react-router-dom";

const Row = ({label, value}: {label: string; value: string | number}) => (
  <Stack
    direction={"row"}
    spacing={1}
    sx={{alignItems: "center", flexWrap: "nowrap"}}>
    <Typography variant="body1" color="textSecondary">
      {label}
    </Typography>
    <Typography
      variant="body1"
      color="textPrimary"
      sx={{textTransform: "capitalize", fontWeight: "bold"}}>
      {value}
    </Typography>
  </Stack>
);

const CurrentSeason = () => {
  const {
    appLoading,
    currentSeason,
    user,
    player,
    seasons,
    mobile,
    setCurrentSeasonId,
  } = useAppContext();
  const {minPlayers} = useRanking();
  const invalidPlayerInfo =
    (player && (!player.name || !player.surname)) ?? false;
  const location = useLocation();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const {loading, addPlayers} = useAddPlayers();

  const handleConfirmJoin = () => {
    setOpen(false);
    addPlayers(currentSeason!, [player!]);
  };

  const isMember =
    currentSeason?.ranking.find(r => r.player.id === player?.id) !== undefined;

  const expired = currentSeason
    ? dayjs(currentSeason.end.toDate()).isBefore(dayjs())
    : false;

  useEffect(() => {
    setExpanded(location.pathname === "/");
  }, [location]);

  if (!appLoading && !currentSeason) {
    return;
  }

  if (location.pathname === "/players") {
    return null;
  }

  return (
    <Paper
      elevation={mobile && location.pathname !== "/" ? 0 : 1}
      sx={{...(location.pathname === "/" && {mx: 2, mt: 2})}}>
      <Stack direction={"row"} sx={{p: 2, alignItems: "center"}} spacing={2}>
        {appLoading && (
          <Stack spacing={1}>
            <Skeleton variant="text" width={120} height={40} />
            <Skeleton variant="text" width={80} height={30} />
          </Stack>
        )}
        {!appLoading && currentSeason && (
          <Stack sx={{flex: 1}}>
            <Stack direction={"row"} sx={{alignItems: "center"}}>
              <SeasonIcon color="secondary" sx={{width: 32, height: 32}} />
              <Select<string>
                sx={{
                  alignSelf: "flex-start",
                  fontSize: "h6.fontSize",
                  fontWeight: "bold",
                }}
                options={seasons.map(season => ({
                  label: season.name,
                  value: season.id!,
                }))}
                value={currentSeason.id}
                onChange={setCurrentSeasonId}
              />
              <IconButton
                sx={{ml: "auto"}}
                onClick={() => setExpanded(!expanded)}>
                {!expanded ? <UnfoldMore /> : <UnfoldLess />}
              </IconButton>
            </Stack>
            <Collapse in={expanded}>
              {!minPlayers && (
                <InfoBox message="Non è stato raggiunto il numero minimo di 16 iscritti" />
              )}
              <Stack
                direction={"row"}
                sx={{
                  gap: 2,
                }}>
                <Row
                  label="Partecipanti"
                  value={currentSeason.ranking.length}
                />
                <Row
                  label="Periodo"
                  value={currentSeason.periods?.length ?? 0}
                />
                <Row
                  label="Inizio"
                  value={dayjs(currentSeason.start.toDate()).format("D MMM YY")}
                />
              </Stack>
              {!isMember && !expired && user && invalidPlayerInfo && (
                <InfoBox
                  sx={{mt: 1}}
                  message="Completa il tuo profilo per partecipare al torneo"
                />
              )}
              <Stack
                direction={"row"}
                spacing={1}
                sx={{mt: 1, justifyContent: "flex-end"}}>
                {!isMember && !expired && user && (
                  <Chip
                    label="Partecipa"
                    color="primary"
                    icon={<SportsTennis fontSize="inherit" />}
                    disabled={loading || invalidPlayerInfo}
                    onClick={() => setOpen(true)}
                  />
                )}
                {isMember && (
                  <Chip
                    variant="outlined"
                    label="Iscritto"
                    color="primary"
                    sx={{ml: 1}}
                  />
                )}
                <Chip
                  variant="outlined"
                  label={expired ? "Terminata" : "In corso"}
                  color={expired ? "error" : "success"}
                />
              </Stack>
            </Collapse>
          </Stack>
        )}
        <ConfirmDialog
          open={open}
          title="Conferma partecipazione"
          content="Cliccando su ok ti impegni a partecipare attivamente al torneo di scala mobile. Assicurati di impostare il numero di telefono sul tuo profilo per poterti aggiungere al gruppo whatsapp."
          onClose={() => setOpen(false)}
          onConfirm={handleConfirmJoin}
        />
      </Stack>
      {mobile && location.pathname !== "/" && <Divider />}
    </Paper>
  );
};

export {CurrentSeason};
