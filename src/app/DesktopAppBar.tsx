import {
  Toolbar,
  AppBar,
  useTheme,
  Typography,
  IconButton,
  Dialog,
  Container,
} from "@mui/material";
import {Key, Logout} from "@mui/icons-material";
import {Login} from "../components/Login";
import {useEffect, useState} from "react";
import {useAppContext} from "./context";
import {Select} from "../components/Select";
import {useQueryCollection} from "../hooks/useQueryCollection";
import {collections} from "../lib/firebase";
import {navigationItems} from "./navigation";
import {Link} from "react-router-dom";

const DesktopAppBar = () => {
  const theme = useTheme();
  const {season, user, setSeason, handleLogout} = useAppContext();
  const [login, setLogin] = useState<boolean>(false);
  const {items: seasons} = useQueryCollection({
    collection: collections?.seasons,
  });

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
      <AppBar position="fixed" sx={{zIndex: theme.zIndex.drawer + 1}}>
        <Container>
          <Toolbar>
            <Link to="/" style={{color: "inherit", textDecoration: "none"}}>
              <img src={`logo.png`} alt="Logo" style={{height: 48}} />
            </Link>
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
            {navigationItems
              .filter(item => item.path !== "/")
              .filter(item => !item.admin || user?.role === "admin")
              .map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    marginLeft: theme.spacing(3),
                  }}>
                  <Typography variant="button">{item.label}</Typography>
                </Link>
              ))}
            <IconButton
              onClick={handleAuthClick}
              color="inherit"
              sx={{ml: "auto"}}>
              {user ? <Logout /> : <Key />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Dialog open={login} onClose={() => setLogin(false)}>
        <Login />
      </Dialog>
    </>
  );
};

export {DesktopAppBar};
