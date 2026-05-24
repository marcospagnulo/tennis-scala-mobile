import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {useEffect, useState} from "react";
import {collections} from "../lib/firebase";
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import type {Player} from "../domain/types";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {Add, Search} from "@mui/icons-material";
import {
  DataGrid,
  GridActionsCell,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";

const initialFormData: Partial<Player> = {
  name: "",
  surname: "",
  birthDate: new Timestamp(new Date().getTime() / 1000, 0),
  phone: "",
  email: "",
  gender: "male",
  status: "active",
  avatar: "",
};

export function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<Partial<Player>>(initialFormData);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);

  useEffect(() => {
    if (!collections) return;
    const unsubscribe = onSnapshot(collections.players, snapshot => {
      const playersData = snapshot.docs.map(
        doc => ({...doc.data(), id: doc.id}) as Player,
      );
      setPlayers(playersData);
    });
    return () => unsubscribe();
  }, []);

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      surname: player.surname,
      birthDate: player.birthDate,
      phone: player.phone,
      email: player.email,
      gender: player.gender,
      status: player.status,
      avatar: player.avatar,
    });
    setOpenFormDialog(true);
  };

  const handleAddClick = () => {
    setSelectedPlayer(null);
    setFormData(initialFormData);
    setOpenFormDialog(true);
  };

  const handleBirthDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    handleChange("birthDate", new Timestamp(date.toDate().getTime() / 1000, 0));
  };

  const handleChange = (
    key: keyof typeof formData,
    value: string | Timestamp,
  ) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedPlayer(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!collections) return;

    if (selectedPlayer) {
      // Update existing player
      const playerDoc = doc(collections.players, selectedPlayer.id);
      await updateDoc(playerDoc, {
        name: formData.name,
        surname: formData.surname,
        birthDate: formData.birthDate,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        status: formData.status,
        avatar: formData.avatar,
      });
    } else {
      // Add new player
      await addDoc(collections.players, {
        name: formData.name,
        surname: formData.surname,
        birthDate: formData.birthDate,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        status: formData.status,
        avatar: formData.avatar,
        createdAt: serverTimestamp(),
      });
    }
    handleCloseFormDialog();
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setPlayerToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete || !collections) return;
    await deleteDoc(doc(collections.players, playerToDelete.id));
    handleCloseDeleteDialog();
  };

  const columns: GridColDef[] = [
    {field: "avatar", headerName: "", width: 80, renderCell: params => {
        return (
          <Box sx={{mt: 0.5}}>
            <Avatar src={params.row.avatar} alt="Avatar" sx={{width: 40, height: 40}} />
          </Box>
        );
    }},
    {field: "surname", headerName: "Cognome", flex: 1},
    {field: "name", headerName: "Nome", flex: 1},
    {
      field: "birthDate",
      headerName: "Data di Nascita",
      flex: 1,
      valueGetter: (value: Timestamp) =>
        value ? dayjs(value.toDate()).format("DD/MM/YYYY") : "",
    },
    {field: "gender", headerName: "Genere", flex: 1},
    {field: "phone", headerName: "Telefono", flex: 1},
    {field: "email", headerName: "Email", flex: 1},
    {
      field: "actions",
      headerName: "",
      type: "actions",
      sortable: false,
      renderCell: params => {
        return (
          <GridActionsCell {...params}>
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" color="primary" />}
              label="Edit"
              onClick={() => handleEditPlayer(params.row as Player)}
            />
            <GridActionsCellItem
              icon={<DeleteIcon fontSize="small" color="error" />}
              label="Delete"
              onClick={() => handleDeleteClick(params.row as Player)}
            />
          </GridActionsCell>
        );
      },
    },
  ];

  const handleFileLoad = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileUpload = evt.target.files?.item(0);
    if (fileUpload) {
      const reader = new FileReader();
      reader.readAsDataURL(fileUpload);
      reader.onload = () => {
        const base64 = reader.result;
        setFormData(prev => ({...prev, avatar: base64 as string}));
      };
    }
  };

  return (
    <Stack sx={{flex: 1, gap: 2}}>
      <Typography variant="h6" gutterBottom>
        Giocatori
      </Typography>
      <Stack direction={"row"} sx={{justifyContent: "flex-end"}}>
        <Button
          variant="contained"
          startIcon={<Add />}
          aria-label="add"
          onClick={handleAddClick}>
          Nuovo
        </Button>
      </Stack>
      <Paper sx={{flex: 1}}>
        <DataGrid
          rows={players}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>
      <Dialog open={openFormDialog} onClose={handleCloseFormDialog}>
        <DialogTitle>
          {selectedPlayer ? "Modifica Giocatore" : "Nuovo Giocatore"}
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" sx={{mb: 2, gap: 2, alignItems: "center"}}>
            <Avatar
              src={formData.avatar}
              alt="Avatar"
              sx={{width: 50, height: 50}}
            />
            <TextField
              type="file"
              onChange={handleFileLoad}
              slotProps={{
                input: {
                  inputProps: {
                    accept:
                      "image/png, image/jpeg, image/jpg, image/gif, image/webp",
                  },
                },
              }}
            />
          </Stack>
          <TextField
            fullWidth
            label="Nome"
            name="name"
            value={formData.name}
            onChange={e => handleChange("name", e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Cognome"
            name="surname"
            value={formData.surname}
            onChange={e => handleChange("surname", e.target.value)}
            margin="normal"
          />
          <Box sx={{mt: 2, mb: 1}}>
            <DatePicker
              format="DD/MM/YYYY"
              label="Data di Nascita"
              value={
                formData.birthDate ? dayjs(formData.birthDate.toDate()) : null
              }
              onChange={handleBirthDateChange}
            />
          </Box>
          <TextField
            fullWidth
            label="Telefono"
            name="phone"
            value={formData.phone}
            onChange={e => handleChange("phone", e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={e => handleChange("email", e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="gender-label">Genere</InputLabel>
            <Select<string>
              labelId="gender-label"
              label="Genere"
              name="gender"
              value={formData.gender}
              onChange={e => handleChange("gender", e.target.value)}>
              <MenuItem value="uomo">Uomo</MenuItem>
              <MenuItem value="donna">Donna</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salva
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare il giocatore "{playerToDelete?.name}"?
            Questa azione è irreversibile.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annulla</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
