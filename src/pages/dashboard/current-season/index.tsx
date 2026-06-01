import {Button, Chip, Stack, Typography} from "@mui/material";
import {useAppContext} from "../../../app/context";
import {SeasonIcon} from "../../../icons";
import {DashboardCard} from "../DashboardCard";
import dayjs from "dayjs";
import {ConfirmDialog} from "../../../components";
import {useState} from "react";
import {useAddPlayers} from "../../../functions/ranking/useAddPlayers";

const Row = ({label, value}: {label: string; value: string | number}) => (
  <Stack direction={"row"} spacing={2} sx={{height: 40, alignItems: "center"}}>
    <Typography variant="body1" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="body1" color="textPrimary">
      {value}
    </Typography>
  </Stack>
);

const CurrentSeasonCard = ({direction}: {direction?: "row" | "column"}) => {
  const {currentSeason, player} = useAppContext();

  const [open, setOpen] = useState<boolean>(false);
  const {loading, addPlayers} = useAddPlayers();

  const handleConfirmJoin = () => {
    setOpen(false);
    addPlayers(currentSeason!, [player!]);
  };

  const canJoin =
    currentSeason?.ranking.find(r => r.player.id === player?.id) === undefined;

  const expired = currentSeason
    ? dayjs(currentSeason.end.toDate()).isBefore(dayjs())
    : false;

  return (
    <DashboardCard
      direction={direction}
      image={
        <Stack
          sx={{
            bgcolor: "primary.dark",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <SeasonIcon color="secondary" sx={{width: "80%", height: "80%"}} />
        </Stack>
      }
      content={
        <Stack sx={{flex: 1, px: 2, pb: 2, position: "relative"}}>
          {currentSeason ? (
            <>
              <Typography variant="h5" sx={{my: 1}}>
                {currentSeason.name}
              </Typography>
              <Row label="Partecipanti" value={currentSeason.ranking.length} />
              <Row label="Periodi" value={currentSeason.periods.length} />
              <Row
                label="Inizio"
                value={dayjs(currentSeason.start.toDate()).format(
                  "D MMMM YYYY",
                )}
              />
              <Row
                label="Fine"
                value={dayjs(currentSeason.end.toDate()).format("D MMMM YYYY")}
              />
              <Chip
                label={expired ? "Scaduta" : "In corso"}
                color={expired ? "error" : "success"}
                sx={{position: "absolute", top: 16, right: 16}}
              />
              {canJoin && !expired && (
                <Button
                  loading={loading}
                  variant="contained"
                  sx={{mt: 2}}
                  onClick={() => setOpen(true)}>
                  Partecipa
                </Button>
              )}
            </>
          ) : (
            <Typography
              variant="h5"
              sx={{alignSelf: "center", justifySelf: "center", my: 4}}>
              Stagione non disponibile
            </Typography>
          )}
          <ConfirmDialog
            open={open}
            title="Conferma partecipazione"
            content="Cliccando su ok ti impegni a partecipare attivamente al torneo di scala mobile. Assicurati di impostare il numero di telefono sul tuo profilo per poterti aggiungere al gruppo whatsapp."
            onClose={() => setOpen(false)}
            onConfirm={handleConfirmJoin}
          />
        </Stack>
      }
    />
  );
};

export {CurrentSeasonCard};
