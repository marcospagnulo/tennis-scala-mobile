import {
  Toolbar,
  AppBar as MuiAppBar,
  useTheme,
  Typography,
  IconButton,
  Dialog,
} from "@mui/material";
import {Key, Logout, Menu, MenuOpen} from "@mui/icons-material";
import {Login} from "./Login";
import {useEffect, useState} from "react";
import {useAppContext} from "../app/context";
import {Select} from "./Select";
import {useQueryCollection} from "../hooks/useQueryCollection";
import {collections} from "../lib/firebase";

const AppBar = ({
  onMenuClick,
  open,
}: {
  onMenuClick: () => void;
  open: boolean;
}) => {
  const theme = useTheme();
  const {season, user, setSeason, handleLogout} = useAppContext();
  const [login, setLogin] = useState<boolean>(false);
  const {items: seasons} = useQueryCollection(collections?.seasons);

  const handleSeasonChange = (seasonId: string) => {
    const selectedSeason = seasons.find(s => s.id === seasonId);
    if (selectedSeason) {
      setSeason(selectedSeason);
    }
  };

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
            {open ? <MenuOpen /> : <Menu />}
          </IconButton>
          {season ? (
            <Select<string>
              sx={{color: "primary.contrastText", ml: 2}}
              options={seasons.map(season => ({
                label: season.name,
                value: season.id,
              }))}
              value={season.id}
              onChange={handleSeasonChange}
            />
          ) : (
            <Typography variant="h6" noWrap component="div" sx={{ml: 2}}>
              {"Scala Mobile"}
            </Typography>
          )}
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
