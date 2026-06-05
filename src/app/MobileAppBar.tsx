import {
  Toolbar,
  AppBar,
  useTheme,
  Typography,
  IconButton,
  Dialog,
} from "@mui/material";
import {Key, Logout, Menu, MenuOpen} from "@mui/icons-material";
import {Auth} from "../components/auth";
import {useEffect, useState} from "react";
import {useAppContext} from "./context";

const MobileAppBar = ({
  onMenuClick,
  open,
}: {
  onMenuClick: () => void;
  open: boolean;
}) => {
  const theme = useTheme();
  const {user, handleLogout} = useAppContext();
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
      <AppBar position="fixed" sx={{zIndex: theme.zIndex.drawer + 1}}>
        <Toolbar>
          <IconButton onClick={onMenuClick} color="inherit">
            {open ? <MenuOpen /> : <Menu />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ml: 2}}>
            {"Scala Mobile"}
          </Typography>
          <IconButton
            onClick={handleAuthClick}
            color="inherit"
            sx={{ml: "auto"}}>
            {user ? <Logout /> : <Key />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Dialog
        open={login}
        onClose={() => setLogin(false)}
        fullWidth
        maxWidth="xs">
        <Auth />
      </Dialog>
    </>
  );
};

export {MobileAppBar};
