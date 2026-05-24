import {CircularProgress, Fade, Stack, useTheme} from "@mui/material";

type Prop = {
  loading: boolean;
};

export default function LoadingView(prop: Prop) {
  const {loading} = prop;
  const theme = useTheme();

  return (
    <Fade in={loading} unmountOnExit>
      <Stack
        sx={{left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: "absolute",
        zIndex: 1202}}>
        <Stack
          sx={{flex: 1, 
          bgcolor: theme.palette.background.default + "cc",
          alignItems: "center",
          justifyContent: "center"}}>
          <CircularProgress />
        </Stack>
      </Stack>
    </Fade>
  );
}
