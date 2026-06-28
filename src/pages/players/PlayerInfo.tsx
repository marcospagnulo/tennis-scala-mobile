import {Avatar, Dialog, DialogContent, Stack, Typography} from "@mui/material";
import dayjs from "dayjs";
import type {Player} from "../../domain/types";
import {useEffect, useState} from "react";

const RowData = ({label, value}: {label: string; value?: string}) => (
  <Stack direction="row" spacing={1}>
    <Typography color="textSecondary">{label}:</Typography>
    <Typography color="textPrimary">{value || "-"}</Typography>
  </Stack>
);

const PlayerInfo = ({
  player,
  onClose,
}: {
  player: Player | undefined;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(player !== undefined);
  }, [player]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      onClose();
    }, 50);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{display: "flex", flexDirection: "column"}}>
          <Stack spacing={2}>
            <Avatar
              src={player?.avatar}
              sx={{width: 150, height: 150, alignSelf: "center"}}
            />
            <Typography variant="h5" align="center">
              {player?.name} {player?.surname}
            </Typography>
            <RowData label="Email" value={player?.email} />
            <RowData label="Telefono" value={player?.phone} />
            <RowData
              label="Data di nascita"
              value={
                player?.birthDate
                  ? dayjs(player.birthDate.toDate()).format("DD/MM/YYYY")
                  : undefined
              }
            />
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export {PlayerInfo};
