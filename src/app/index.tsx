import {Route, Routes} from "react-router-dom";
import {
  AppBar,
  Container,
  Stack,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {DashboardPage} from "../pages/dashboard";
import {MatchesPage} from "../pages/Matches";
import {PlayersPage} from "../pages/players";
import {MobileAppBar, Drawer} from "../components";
import {useState} from "react";
import {SeasonsPage} from "../pages/season";
import {AppProvider} from "./context";
import {RankingPage} from "../pages/ranking";
import {DesktopAppBar} from "./DesktopAppBar";
import {navigationItems} from "./navigation";

const App = () => {
  const mobile = useMediaQuery(useTheme().breakpoints.down("md"));
  const [drawer, setDrawer] = useState<boolean>(!mobile);

  return (
    <AppProvider>
      <Stack direction="row" sx={{flex: 1}}>
        {mobile ? (
          <>
            <MobileAppBar
              onMenuClick={() => setDrawer(!drawer)}
              open={drawer}
            />
            <Drawer
              open={drawer}
              onOpen={() => setDrawer(true)}
              onClose={() => setDrawer(false)}
            />
          </>
        ) : (
          <DesktopAppBar />
        )}
        <Stack sx={{flex: "1 1 0", overflow: "hidden"}}>
          <Toolbar />
          <Container
            sx={{
              flex: "1 1 0",
              display: "flex",
              flexDirection: "column",
              p: 0,
            }}>
            <Routes>
              {navigationItems.map(item => (
                <Route
                  key={item.path}
                  path={item.path}
                  element={item.element}
                />
              ))}
              <Route
                path="/"
                element={<DashboardPage sx={{flex: 1, p: 2}} />}
              />
              <Route
                path="/players"
                element={<PlayersPage sx={{flex: 1, p: 2}} />}
              />
              <Route
                path="/matches"
                element={<MatchesPage sx={{flex: 1, p: 2}} />}
              />
              <Route
                path="/seasons"
                element={<SeasonsPage sx={{flex: 1, p: 2}} />}
              />
              <Route
                path="/ranking"
                element={<RankingPage sx={{flex: 1, p: 2}} />}
              />
            </Routes>
          </Container>
        </Stack>
      </Stack>
    </AppProvider>
  );
};

export {App};
