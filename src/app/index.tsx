import {Route, Routes} from "react-router-dom";
import {
  Box,
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
import dayjs from "dayjs";
import {useEffect} from "react";

const App = () => {
  const mobile = useMediaQuery(useTheme().breakpoints.down("md"));

  useEffect(() => {
    dayjs.locale("it");
  }, []);

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
                    <ErrorIcon color="error" sx={{fontSize: 180}} />
                    <Typography variant="h4">Pagina non trovata</Typography>
                  </Stack>
                }
              />
            </Routes>
          </Container>
          {mobile && (
            <>
              <Box sx={{height: 64}} />
              <BottomNavigation />
            </>
          )}
        </Stack>
      </Stack>
    </AppProvider>
  );
};

export {App};
