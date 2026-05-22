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
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  }

  const handleAddClick = () => {
    setSelectedPlayer(null)
    setFormData(initialFormData)
  }
    
  const handleBirthDateChange = (date: dayjs.Dayjs | null) => { 
    if (!date) return;
    handleChange('birthDate', new Timestamp(date.toDate().getTime() / 1000, 0))
  }

  const handleChange = (key: keyof typeof formData, value: string | Timestamp) => {
    setFormData(prev => ({ ...prev, [key]: value }))
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
    setSelectedPlayer(null)
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>Giocatori</Typography>
      <Grid container spacing={2}>
        <Grid size={8}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Cognome</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Data di Nascita</TableCell>
                  <TableCell>Genere</TableCell>
                  <TableCell>Telefono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map(player => (
                  <TableRow
                    key={player.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {player.surname}
                    </TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.birthDate ? dayjs(player.birthDate.toDate()).format('DD/MM/YYYY') : ''}</TableCell>
                    <TableCell>{player.gender}</TableCell>
                    <TableCell>{player.phone}</TableCell>
                    <TableCell>{player.email}</TableCell>
                    <TableCell align="right">
                      <Stack direction={'row'} spacing={1}>
                        <IconButton
                          size="small"
                          aria-label="edit"
                          onClick={() => handleEditPlayer(player)}
                        >
                          <EditIcon fontSize="small" color='primary' />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="delete"
                          onClick={() => handleDeleteClick(player)}
                        >
                          <DeleteIcon fontSize="small" color='error'/>
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid size={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              {selectedPlayer ? 'Modifica Giocatore' : 'Nuovo Giocatore'}
            </Typography>
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
              <Button type="submit" variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
                Salva
              </Button>
          </Paper>
        </Grid>
      </Grid>
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={handleAddClick}>
        <Add />
      </Fab>
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
    </Box>
  )
}
