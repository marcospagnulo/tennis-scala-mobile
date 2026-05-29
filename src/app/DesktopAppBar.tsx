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
} from "@mui/material";
import {Key, Logout} from "@mui/icons-material";
import {Auth} from "../components/auth";
import {useEffect, useState} from "react";
import {useAppContext} from "./context";
import {Select} from "../components/Select";
import {navigationItems} from "./navigation";
import {Link, useLocation, useNavigate} from "react-router-dom";

const DesktopAppBar = () => {
  const theme = useTheme();
  const {appLoading, season, seasons, user, setSeason, handleLogout} =
    useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [tabValue, setTabValue] = useState<string | boolean>(false);
  const [login, setLogin] = useState<boolean>(false);

  const handleSeasonChange = (seasonId: string) => {
    const selectedSeason = seasons.find(s => s.id === seasonId);
    if (selectedSeason) {
      setSeason(selectedSeason);
    }
  };

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
                <IconButton
                  onClick={handleAuthClick}
                  color="inherit"
                  sx={{ml: "auto"}}>
                  {user ? <Logout /> : <Key />}
                </IconButton>
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
