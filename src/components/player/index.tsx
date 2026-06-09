import {Avatar, Box, Dialog, IconButton, Paper, Stack} from "@mui/material";
import {useAppContext} from "../../app/context";
import {collections} from "../../lib/firebase";
import {doc, Timestamp, updateDoc} from "firebase/firestore";
import {PlayerRowData} from "./PlayerRowData";
import {useRef, useState} from "react";
import {EditIcon} from "../../icons";

const PlayerCard = ({open, onClose}: {open: boolean; onClose: () => void}) => {
  const {player, setPlayer} = useAppContext();

  const [hover, setHover] = useState(false);

  const handleEdit = async (
    field: string,
    value: string | number | Timestamp,
  ) => {
    if (!collections || !player) return;
    const document = doc(collections.players, player.id);
    const updatedPlayer = {...player, [field]: value};
    await updateDoc(document, updatedPlayer);
    setPlayer(updatedPlayer);
  };

  const handleFileLoad = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileUpload = evt.target.files?.item(0);
    if (fileUpload) {
      const reader = new FileReader();
      reader.readAsDataURL(fileUpload);
      reader.onload = () => {
        const base64 = reader.result;
        handleEdit("avatar", base64 as string);
      };
    }
  };

  const inputFileRef = useRef<HTMLInputElement>(null);

  if (!player) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root:first-child": {
          bgcolor: "transparent",
          "--Paper-shadow": "none !important",
        },
      }}>
      <Stack
        sx={{
          width: 160,
          height: 160,
          position: "relative",
          borderRadius: "50%",
          overflow: "hidden",
          margin: "auto",
          mb: -10,
        }}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}>
        {player.avatar ? (
          <Box
            sx={{
              backgroundImage: `url(${player.avatar})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <Avatar sx={{width: "100%", height: "100%"}} />
        )}

        <input
          ref={inputFileRef}
          type="file"
          onChange={handleFileLoad}
          style={{display: "none"}}
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
        />

        {hover && (
          <Stack
            sx={{
              bgcolor: "background.default",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.8,
            }}>
            <IconButton onClick={() => inputFileRef.current?.click()}>
              <EditIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>
      <Paper>
        <Stack sx={{mt: 10, p: 2, minWidth: 400}}>
          <PlayerRowData
            label="Nome"
            value={player.name}
            editable
            type="string"
            onEdit={v => handleEdit("name", v)}
          />
          <PlayerRowData
            label="Cognome"
            value={player.surname}
            editable
            type="string"
            onEdit={v => handleEdit("surname", v)}
          />
          <PlayerRowData
            label="Telefono"
            value={player.phone}
            editable
            type="tel"
            onEdit={v => handleEdit("phone", v)}
          />
          <PlayerRowData
            label="Data di nascita"
            value={player.birthDate}
            editable
            type="date"
            onEdit={v => handleEdit("birthDate", v)}
          />
          <PlayerRowData
            label="Genere"
            value={player.gender}
            editable
            type="gender"
            onEdit={v => handleEdit("gender", v)}
          />
        </Stack>
      </Paper>
    </Dialog>
  );
};

export {PlayerCard};
