import {Route, Routes} from "react-router-dom";
import {
  Container,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {MobileAppBar, Drawer} from "../components";
import {useState} from "react";
import {AppProvider} from "./context";
import {DesktopAppBar} from "./DesktopAppBar";
import {navigationItems} from "./navigation";
import {ReportProblem} from "@mui/icons-material";

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
            maxWidth="md"
            sx={{
              flex: "1 1 0",
              display: "flex",
              flexDirection: "column",
              ...(mobile && {pl: "0 !important", pr: "0 !important"}),
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
                path="*"
                element={
                  <Stack
                    spacing={2}
                    sx={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <ReportProblem color="error" sx={{fontSize: 180}} />
                    <Typography variant="h4">Pagina non trovata</Typography>
                  </Stack>
                }
              />
            </Routes>
          </Container>
        </Stack>
      </Stack>
    </AppProvider>
  );
};

export {App};
