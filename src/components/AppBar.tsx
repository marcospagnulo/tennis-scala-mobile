import {
  Toolbar,
  AppBar as MuiAppBar,
  useTheme,
  Typography,
  IconButton,
  Dialog,
} from "@mui/material";
import {Key, Logout, Menu} from "@mui/icons-material";
import {useAuth} from "../hooks/useAuth";
import {Login} from "../pages/Login";
import {useEffect, useState} from "react";

const AppBar = ({onMenuClick}: {onMenuClick: () => void}) => {
  const theme = useTheme();
  const {user, handleLogout} = useAuth();
  const [login, setLogin] = useState<boolean>(false);

  const handleAuthClick = () => {
    if (user) {
      handleLogout();
    } else {
      setLogin(true);
    }
  };

  useEffect(() => {
    if (user) {
      setLogin(false);
    }
  }, [user]);

  return (
    <>
      <MuiAppBar position="fixed" sx={{zIndex: theme.zIndex.drawer + 1}}>
        <Toolbar>
          <IconButton onClick={onMenuClick} color="inherit">
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ml: 2}}>
            Tennis Scala Mobile
          </Typography>
          <IconButton
            onClick={handleAuthClick}
            color="inherit"
            sx={{ml: "auto"}}>
            {user ? <Logout /> : <Key />}
          </IconButton>
        </Toolbar>
      </MuiAppBar>
      <Dialog open={login} onClose={() => setLogin(false)}>
        <Login />
      </Dialog>
    </>
  );
};

export {AppBar};
