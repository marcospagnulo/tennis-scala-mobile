import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import {useAppContext} from "../../../app/context";
import {collections} from "../../../lib/firebase";
import {useFindById} from "../../../functions/useFindById";
import type {Player} from "../../../domain/types";
import {ChallengeIcon} from "../../../icons";
import {useAddChallenge} from "../../../functions/season/useAddChallenge";
import {useState} from "react";
import type {Dayjs} from "dayjs";
import dayjs from "dayjs";
import {MobileDateTimePicker} from "@mui/x-date-pickers";

const ChallengeDialog = ({
  open,
  challengePlayerId,
  onClose,
}: {
  open: boolean;
  challengePlayerId?: string;
  onClose: () => void;
}) => {
  const {player, currentSeason} = useAppContext();
  const {data: challengePlayer, loading} = useFindById({
    collection: collections?.players,
    id: challengePlayerId,
  });
  const {loading: adding, addChallenge} = useAddChallenge();

  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const handleChallenge = () => {
    if (!currentSeason || !player || !challengePlayer || !date) return;
    addChallenge(currentSeason, player, challengePlayer, date.toDate());
  };

  const handleClose = () => {
    onClose();
  };

  const renderPlayer = (player: Player) => {
    return (
      <Stack spacing={2}>
        <Avatar
          src={player.avatar}
          sx={{width: 130, height: 130, alignSelf: "center"}}
        />
        <Typography variant="h6" align="center">
          {player.name} {player.surname}
        </Typography>
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <Stack>
          <ChallengeIcon
            color="action"
            sx={{
              alignSelf: "center",
              fontSize: 60,
            }}
          />
          <Typography variant="h5" align="center" gutterBottom>
            Sfida giocatore
          </Typography>
        </Stack>

        {!loading && (
          <Stack direction="row" sx={{gap: 2}}>
            {player && renderPlayer(player)}
            <Typography variant="h6" align="center" sx={{alignSelf: "center"}}>
              VS
            </Typography>
            {challengePlayer && renderPlayer(challengePlayer)}
          </Stack>
        )}
        {loading && (
          <Stack sx={{my: 2}}>
            <CircularProgress sx={{alignSelf: "center"}} />
          </Stack>
        )}
        <MobileDateTimePicker
          label="Data della sfida"
          sx={{mt: 2, "& .MuiPickersInputBase-sectionsContainer": {py: 1}}}
          format="DD/MM/YYYY HH:mm"
          slotProps={{textField: {variant: "standard", size: "small"}}}
          value={date}
          onAccept={setDate}
        />
      </DialogContent>
      {
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Chiudi
          </Button>
          <Button
            disabled={loading || adding || !date}
            loading={loading || adding || !date}
            onClick={handleChallenge}
            color="primary"
            variant="contained">
            Sfida
          </Button>
        </DialogActions>
      }
    </Dialog>
  );
};

export {ChallengeDialog};
