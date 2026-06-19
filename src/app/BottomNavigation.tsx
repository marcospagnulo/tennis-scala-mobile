import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Avatar,
  IconButton,
  Box,
  Stack,
} from "@mui/material";
import {navigationItems} from "./navigation";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAppContext} from "./context";
import {PlayerDialog} from "../components/player";

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
        height: "calc(64px + env(safe-area-inset-bottom))",
        bgcolor: "primary.main",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme => theme.zIndex.drawer + 1,
      }}>
      {navigationItems.map(item => (
        <BottomNavigationAction
          sx={{
            py: 1,
            px: 0,
            gap: 1,
            color: "#fff",
            "&.Mui-selected": {
              color: "secondary.main",
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: 12,
            },
          }}
          key={item.path}
          label={item.label}
          icon={<item.icon />}
        />
      ))}
      {player && (
        <Stack
          sx={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: 0,
            right: 0,
            margin: "auto",
            bottom: "calc((72px + env(safe-area-inset-bottom)) / 2)",
            width: 72,
            height: 72,
          }}>
          <Box
            sx={{
              position: "absolute",
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "primary.main",
              zIndex: -1,
            }}
          />
          <IconButton sx={{p: 0}} onClick={() => setOpen(true)}>
            <Avatar
              src={player.avatar}
              sx={{
                width: 64,
                height: 64,
              }}
            />
          </IconButton>
        </Stack>
      )}
      <PlayerDialog open={open} onClose={() => setOpen(false)} />
    </MuiBottomNavigation>
  );
};

export {BottomNavigation};
