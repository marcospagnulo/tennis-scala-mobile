import {Route, Routes} from "react-router-dom";
import {
  Container,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {AppProvider} from "./context";
import {DesktopAppBar} from "./DesktopAppBar";
import {navigationItems} from "./navigation";
import {BottomNavigation} from "./BottomNavigation";
import {MobileAppBar} from "./MobileAppBar";
import {ErrorIcon} from "../icons";

const App = () => {
  const mobile = useMediaQuery(useTheme().breakpoints.down("md"));

  return (
    <AppProvider>
      <Stack direction="row" sx={{flex: 1}}>
        {mobile ? <MobileAppBar /> : <DesktopAppBar />}
        <Stack sx={{flex: "1 1 0", overflow: "hidden"}}>
          <Toolbar />
          <Container
            maxWidth="md"
            sx={{
              flex: "1 1 0",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              ...(mobile && {pl: "0 !important", pr: "0 !important", pb: 7}),
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
                    <ErrorIcon color="error" sx={{fontSize: 180}} />
                    <Typography variant="h4">Pagina non trovata</Typography>
                  </Stack>
                }
              />
            </Routes>
            {mobile && <BottomNavigation />}
          </Container>
        </Stack>
      </Stack>
    </AppProvider>
  );
};

export {App};
