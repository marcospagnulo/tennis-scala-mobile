import {Route, Routes} from "react-router-dom";
import {
  Container,
  Stack,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {MobileAppBar, Drawer} from "../components";
import {useState} from "react";
import {AppProvider} from "./context";
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
              py: mobile ? 0 : 2,
            }}>
            <Routes>
              {navigationItems.map(item => (
                <Route
                  key={item.path}
                  path={item.path}
                  element={item.element}
                />
              ))}
            </Routes>
          </Container>
        </Stack>
      </Stack>
    </AppProvider>
  );
};

export {App};
