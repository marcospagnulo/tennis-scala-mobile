import {
  Autocomplete,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Fab,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {Admin, PlayerAvatar} from "../../components";
import {Add} from "@mui/icons-material";
import {useEffect, useState} from "react";
import {useAppContext} from "../../app/context";
import {MobileDateTimePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {useAddMatch} from "../../functions";

const PlayerSelect = ({
  pid,
  onSelect,
}: {
  pid?: string;
  onSelect: (pid: string | undefined) => void;
}) => {
  const {currentSeason} = useAppContext();

  const players = [
    ...(currentSeason?.ranking.map(r => r.player) ?? []).sort((a, b) => {
      const surnameA = (a.surname ?? "").toLowerCase();
      const surnameB = (b.surname ?? "").toLowerCase();

      const surnameCompare = surnameA.localeCompare(surnameB);

      return surnameCompare !== 0
        ? surnameCompare
        : (a.name ?? "").localeCompare(b.name ?? "");
    }),
  ];

  return (
    <Stack
      sx={{flex: 1, gap: 2, justifyContent: "center", alignItems: "center"}}>
      {pid ? (
        <PlayerAvatar playerId={pid} size={80} />
      ) : (
        <Avatar sx={{width: 80, height: 80}} />
      )}
      <Autocomplete
        onChange={(_event, value) => onSelect(value?.value)}
        sx={{width: 250}}
        options={players.map(p => ({
          label: `${p.surname} ${p.name}`,
          value: p.id,
        }))}
        renderInput={params => <TextField {...params} label="Giocatore" />}
      />
    </Stack>
  );
};

const AddMatch = () => {
  const {currentSeason, mobile} = useAppContext();
  const {loading, success, clear, addMatch} = useAddMatch();

  const [open, setOpen] = useState(false);
  const [player1, setPlayer1] = useState<string>();
  const [player2, setPlayer2] = useState<string>();
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs());
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setValid(!!player1 && !!player2 && player1 !== player2);
  }, [player1, player2, date]);

  const handleClose = () => {
    setOpen(false);
    setPlayer1(undefined);
    setPlayer2(undefined);
    setDate(dayjs());
  };

  useEffect(() => {
    if (success) {
      handleClose();
      clear();
    }
  }, [success, clear]);

  const handleChangeDate = async (date: dayjs.Dayjs | null) => {
    if (!date) return;
    setDate(date);
  };

  const handleSave = async () => {
    addMatch(currentSeason!, player1!, player2!, date.toDate());
  };

  return (
    <Admin>
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          right: 32,
          bottom: mobile ? "calc(80px + env(safe-area-inset-bottom))" : 32,
          zIndex: 1,
        }}
        onClick={() => setOpen(true)}>
        <Add />
      </Fab>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}>
          <Stack direction="row" sx={{gap: 2, justifyContent: "center", mb: 2}}>
            <PlayerSelect pid={player1} onSelect={setPlayer1} />
            <Typography variant="h6" sx={{alignSelf: "center"}}>
              vs
            </Typography>
            <PlayerSelect pid={player2} onSelect={setPlayer2} />
          </Stack>
          <MobileDateTimePicker
            defaultValue={date}
            onAccept={handleChangeDate}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button
            disabled={!valid || loading}
            loading={loading}
            onClick={handleSave}
            variant="contained">
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </Admin>
  );
};

export {AddMatch};
