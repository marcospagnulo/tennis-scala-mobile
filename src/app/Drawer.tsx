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
import {navigationItems} from "./navigation";

const drawerWidth = 240;

const DrawerItem = ({
  to,
  icon,
  text,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) => {
  const location = useLocation();
  const selected = location.pathname.indexOf(to) !== -1;
  return (
    <ListItem disablePadding sx={{"&.Mui-selected": {fontWeight: "bold"}}}>
      <ListItemButton
        component={Link}
        to={to}
        selected={selected}
        onClick={onClick}>
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
          {navigationItems.map(item => (
            <DrawerItem
              key={item.path}
              to={item.path}
              icon={<item.icon />}
              text={item.label}
              onClick={onClose}
            />
          ))}
        </List>
      </Box>
    </DrawerContainer>
  );
};

export {Drawer};
