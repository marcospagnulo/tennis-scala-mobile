import {Route, Routes} from "react-router-dom";
import {Stack, Toolbar, useMediaQuery, useTheme} from "@mui/material";
import {DashboardPage} from "./pages/Dashboard";
import {MatchesPage} from "./pages/Matches";
import {PlayersPage} from "./pages/Players";
import {AppBar, Drawer} from "./components";
import {useState} from "react";

function App() {
  const mobile = useMediaQuery(useTheme().breakpoints.down("md"));
  const [drawer, setDrawer] = useState<boolean>(!mobile);

  return (
    <Stack direction="row" sx={{flex: 1}}>
      <AppBar onMenuClick={() => setDrawer(!drawer)} open={drawer} />
      <Drawer open={drawer} onOpen={() => setDrawer(true)} onClose={() => setDrawer(false)} />
      <Stack sx={{flex: "1 1 0", overflow: "hidden"}}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<DashboardPage sx={{flex: 1, p: 2}} />} />
          <Route
            path="/players"
            element={<PlayersPage sx={{flex: 1, p: 2}} />}
          />
          <Route path="/matches" element={<MatchesPage sx={{flex: 1, p: 2}} />} />
        </Routes>
      </Stack>
    </Stack>
  );
}

export default App;
