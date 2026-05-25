import {Link} from "react-router-dom";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SportsTennisRoundedIcon from "@mui/icons-material/SportsTennisRounded";
import {
  Box,
  Drawer as MuiDrawer,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Toolbar,
} from "@mui/material";

const drawerWidth = 240;

const Drawer = ({open, onOpen, onClose}: {open: boolean, onOpen: () => void, onClose: () => void}) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));

  const DrawerContainer = mobile ? SwipeableDrawer : MuiDrawer;

  return (
    <DrawerContainer
      onOpen={onOpen}
      onClose={onClose}
      open={open}
      variant={mobile ? "temporary" : "persistent"}
      sx={{
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        width: open ? drawerWidth : 0,
        [`& .MuiDrawer-paper`]: {width: drawerWidth},
      }}>
      <Toolbar />
      <Box sx={{overflow: "auto"}}>
        <List sx={{py: 0}}>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/">
              <ListItemIcon>
                <DashboardRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/players">
              <ListItemIcon>
                <GroupsRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Giocatori" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/matches">
              <ListItemIcon>
                <SportsTennisRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Partite" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </DrawerContainer>
  );
};

export {Drawer};
