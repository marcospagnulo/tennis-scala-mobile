import {Link, useLocation} from "react-router-dom";
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
import {
  DashboardIcon,
  MatchIcon,
  PlayersIcon,
  RankingIcon,
  SeasonIcon,
} from "../icons";

const drawerWidth = 240;

const DrawerItem = ({
  to,
  icon,
  text,
}: {
  to: string;
  icon: React.ReactNode;
  text: string;
}) => {
  const location = useLocation();
  const selected = location.pathname.indexOf(to) !== -1;
  return (
    <ListItem disablePadding sx={{"&.Mui-selected": {fontWeight: "bold"}}}>
      <ListItemButton component={Link} to={to} selected={selected}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );
};

const Drawer = ({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
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
          <DrawerItem to="/" icon={<DashboardIcon />} text="Dashboard" />
          <DrawerItem to="/seasons" icon={<SeasonIcon />} text="Stagioni" />
          <DrawerItem to="/ranking" icon={<RankingIcon />} text="Ranking" />
          <DrawerItem to="/matches" icon={<MatchIcon />} text="Partite" />
          <DrawerItem to="/players" icon={<PlayersIcon />} text="Giocatori" />
        </List>
      </Box>
    </DrawerContainer>
  );
};

export {Drawer};
