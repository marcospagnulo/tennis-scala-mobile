import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { Link, Route, Routes } from 'react-router-dom'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { Login } from './components/Login'
import { auth } from './lib/firebase'
import { DashboardPage } from './pages/Dashboard'
import { MatchesPage } from './pages/Matches'
import { PlayersPage } from './pages/Players'

const drawerWidth = 240

function App() {
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
      <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Typography>Caricamento...</Typography>
      </Box>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f6fb', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.secondary" variant="body2">
              Benvenuto, {user.displayName}
            </Typography>
          </Box>
          <Button onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
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
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/matches" element={<MatchesPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
