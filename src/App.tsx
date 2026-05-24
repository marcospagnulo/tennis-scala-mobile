import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { Link, Route, Routes } from 'react-router-dom'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { Login } from './pages/Login'
import { auth } from './lib/firebase'
import { DashboardPage } from './pages/Dashboard'
import { MatchesPage } from './pages/Matches'
import { PlayersPage } from './pages/Players'
import LoadingView from './components/LoadingView'
import { Logout } from '@mui/icons-material'

const drawerWidth = 240

function App() {
  const theme = useTheme();
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    if(!auth) {
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
    }
  }

  if (user === undefined) {
    return (
      <LoadingView loading={true} />
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Stack direction="row" sx={{flex: 1}}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Stack sx={{p: 1, gap: 1, bgcolor: "primary.dark", color: theme.palette.primary.contrastText}}>
          <Typography color="text.secondary" variant="body2">
            Benvenuto, {user.displayName}
          </Typography>
        </Stack>
        <Box sx={{ overflow: 'auto' }}>
          <List sx={{py: 0}}>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/">
                <ListItemIcon>
                  <DashboardRoundedIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/players">
                <ListItemIcon>
                  <GroupsRoundedIcon />
                </ListItemIcon>
                <ListItemText primary="Giocatori" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/matches">
                <ListItemIcon>
                  <SportsTennisRoundedIcon />
                </ListItemIcon>
                <ListItemText primary="Partite" />
              </ListItemButton>
            </ListItem>
            <Divider  />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Stack sx={{ flexGrow: 1, p: 2 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/matches" element={<MatchesPage />} />
        </Routes>
      </Stack>
    </Stack>
  )
}

export default App
