import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Avatar,
  IconButton,
  Box,
  Dialog,
} from "@mui/material";
import {navigationItems} from "./navigation";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAppContext} from "./context";
import {PlayerCard} from "../pages/dashboard/player";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState<number>(0);
  const {player} = useAppContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const path = navigationItems[value].path;
    navigate(path);
  }, [value, navigate]);

  return (
    <MuiBottomNavigation
      showLabels
      value={value}
      onChange={(_e, v) => setValue(v)}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme => theme.zIndex.drawer + 1,
      }}>
      {navigationItems.map(item => (
        <BottomNavigationAction
          key={item.path}
          label={item.label}
          icon={<item.icon />}
        />
      ))}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          margin: "auto",
          bottom: 24,
          width: 64,
          height: 64,
        }}>
        <IconButton sx={{p: 0}} onClick={() => setOpen(true)}>
          <Avatar
            src={player?.avatar}
            sx={{
              width: 64,
              height: 64,
            }}
          />
        </IconButton>
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        sx={{
          "& .MuiPaper-root:first-child": {
            bgcolor: "transparent",
            "--Paper-shadow": "none !important",
          },
        }}
        fullWidth>
        <PlayerCard direction="column" />
      </Dialog>
    </MuiBottomNavigation>
  );
};

export {BottomNavigation};
