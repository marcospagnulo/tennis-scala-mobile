import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'
import { collections } from '../lib/firebase'
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import type { Player } from '../domain/types'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { Add } from '@mui/icons-material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'

const initialFormData: Partial<Player> = {
  name: '',
  surname: '',
  birthDate: new Timestamp(new Date().getTime() / 1000, 0),
  phone: '',
  email: '',
  gender: 'other',
  status: 'active',
}

export function PlayersPage() {


  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [formData, setFormData] = useState<Partial<Player>>(initialFormData)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const [openFormDialog, setOpenFormDialog] = useState(false)

  useEffect(() => {
    if (!collections) return
    const unsubscribe = onSnapshot(collections.players, snapshot => {
      const playersData = snapshot.docs.map(
        doc => ({ ...doc.data(), id: doc.id }) as Player,
      )
      setPlayers(playersData)
    })
    return () => unsubscribe()
  }, [])

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setFormData({
        name: player.name,
        surname: player.surname,
        birthDate: player.birthDate,
        phone: player.phone,
        email: player.email,
        gender: player.gender,
        status: player.status,
    })
    setOpenFormDialog(true)
  }

  const handleAddClick = () => {
    setSelectedPlayer(null)
    setFormData(initialFormData)
    setOpenFormDialog(true)
  }
    
  const handleBirthDateChange = (date: dayjs.Dayjs | null) => { 
    if (!date) return;
    handleChange('birthDate', new Timestamp(date.toDate().getTime() / 1000, 0))
  }

  const handleChange = (key: keyof typeof formData, value: string | Timestamp) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false)
    setSelectedPlayer(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async () => {

    if (!collections) return

    if (selectedPlayer) {
      // Update existing player
      const playerDoc = doc(collections.players, selectedPlayer.id)
      await updateDoc(playerDoc, {
        name: formData.name,
        surname: formData.surname,
        birthDate: formData.birthDate,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        status: formData.status,
      })
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
        realPoints: 0,
        historicalMatches: 0,
        previousPeriodOpponentIds: [],
        irrevocableRefusalsCurrentPeriod: 0,
        irrevocableRefusalsTotal: 0,
        bookedMatchDates: [],
        createdAt: serverTimestamp(),
      })
    }
    handleCloseFormDialog()
  }

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setPlayerToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!playerToDelete || !collections) return
    await deleteDoc(doc(collections.players, playerToDelete.id))
    handleCloseDeleteDialog()
  }

  const columns: GridColDef[] = [
    { field: 'surname', headerName: 'Cognome', flex: 1 },
    { field: 'name', headerName: 'Nome', flex: 1 },
    {
      field: 'birthDate',
      headerName: 'Data di Nascita',
      flex: 1,
      valueGetter: (value: Timestamp) => value ? dayjs(value.toDate()).format('DD/MM/YYYY') : '',
    },
    { field: 'gender', headerName: 'Genere', flex: 1 },
    { field: 'phone', headerName: 'Telefono', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      renderCell: (params) => {
        return (
          <Stack direction={'row'} spacing={1}>
            <IconButton
              size="small"
              aria-label="edit"
              onClick={() => handleEditPlayer(params.row as Player)}
            >
              <EditIcon fontSize="small" color='primary' />
            </IconButton>
            <IconButton
              size="small"
              aria-label="delete"
              onClick={() => handleDeleteClick(params.row as Player)}
            >
              <DeleteIcon fontSize="small" color='error'/>
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>Giocatori</Typography>
      <Paper style={{ height: 600, flexGrow: 1 }}>
        <DataGrid
          rows={players}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={handleAddClick}>
        <Add />
      </Fab>
      <Dialog open={openFormDialog} onClose={handleCloseFormDialog}>
        <DialogTitle>{selectedPlayer ? 'Modifica Giocatore' : 'Nuovo Giocatore'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome"
            name="name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            margin="normal"
            />
            <TextField
                fullWidth
                label="Cognome"
                name="surname"
                value={formData.surname}
                onChange={e => handleChange('surname', e.target.value)}
                margin="normal"
            />
            <Box sx={{ mt: 2, mb: 1 }}>
                <DatePicker
                    format='DD/MM/YYYY'
                    label="Data di Nascita"
                    value={formData.birthDate ? dayjs(formData.birthDate.toDate()): null}
                    onChange={handleBirthDateChange}
                />  
            </Box>
            <TextField
                fullWidth
                label="Telefono"
                name="phone"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                margin="normal"
            />
            <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                margin="normal"
            />
            <FormControl fullWidth margin="normal">
                <InputLabel id="gender-label">Genere</InputLabel>
                <Select<string>
                    labelId="gender-label"
                    label="Genere"
                    name="gender"
                    value={formData.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                >
                    <MenuItem value="male">Maschio</MenuItem>
                    <MenuItem value="female">Femmina</MenuItem>
                    <MenuItem value="other">Altro</MenuItem>
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
  )
}
