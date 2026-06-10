import {
  Toolbar,
  AppBar,
  useTheme,
  Typography,
  IconButton,
  Dialog,
  Container,
  Tab,
  Tabs,
  Tooltip,
  Stack,
  Avatar,
  ButtonBase,
} from "@mui/material";
import {Key, Logout} from "@mui/icons-material";
import {Auth} from "../components/auth";
import {useEffect, useState} from "react";
import {useAppContext} from "./context";
import {navigationItems} from "./navigation";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {PlayerDialog} from "../components/player";

const DesktopAppBar = () => {
  const theme = useTheme();
  const {appLoading, user, player, handleLogout} = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [tabValue, setTabValue] = useState<string | boolean>(false);
  const [login, setLogin] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const handleTabChange = (_e: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const handleAuthClick = () => {
    if (user) {
      handleLogout();
    } else {
      setLogin(true);
    }
  };

  useEffect(() => {
    const matchedItem = navigationItems.find(
      item => item.path === location.pathname,
    );
    if (
      location.pathname === "/" ||
      !matchedItem ||
      (matchedItem.admin && user?.role !== "admin")
    ) {
      setTabValue(false);
    } else {
      setTabValue(matchedItem.path);
    }
  }, [location.pathname, user]);

  useEffect(() => {
    if (user) {
      setLogin(false);
    }
  }, [user]);

  return (
    <>
      <AppBar position="fixed" sx={{zIndex: theme.zIndex.drawer + 1}}>
        <Container maxWidth="md">
          <Toolbar sx={{px: "0 !important"}}>
            <Link to="/" style={{color: "inherit", textDecoration: "none"}}>
              <img src={`logo.png`} alt="Logo" style={{height: 48}} />
            </Link>
            <Typography variant="h6" noWrap component="div" sx={{ml: 2}}>
              {"Scala Mobile"}
            </Typography>
            {!appLoading && (
              <>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{ml: 4}}
                  indicatorColor="secondary"
                  textColor="inherit">
                  {navigationItems
                    .filter(item => item.path !== "/")
                    .filter(item => !item.admin || user?.role === "admin")
                    .map(item => (
                      <Tab
                        key={item.path}
                        label={item.label}
                        value={item.path}
                      />
                    ))}
                </Tabs>
                <Stack
                  direction={"row"}
                  sx={{alignItems: "center", ml: "auto"}}
                  spacing={2}>
                  {player && (
                    <ButtonBase onClick={() => setOpen(true)} sx={{gap: 1}}>
                      <Avatar src={player.avatar ?? undefined} />
                      <Stack sx={{alignItems: "start"}}>
                        <Typography variant="body2">{player.name}</Typography>
                        <Typography variant="body2">
                          {player.surname}
                        </Typography>
                      </Stack>
                    </ButtonBase>
                  )}
                  <PlayerDialog open={open} onClose={() => setOpen(false)} />
                  <IconButton onClick={handleAuthClick} color="inherit">
                    <Tooltip
                      title={user ? "Logout" : "Login"}
                      placement="bottom">
                      {user ? <Logout /> : <Key />}
                    </Tooltip>
                  </IconButton>
                </Stack>
              </>
            )}
          </Toolbar>
        </Container>
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

export {DesktopAppBar};
