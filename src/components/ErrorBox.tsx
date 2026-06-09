import {Stack, Typography, useTheme} from "@mui/material";
import {ErrorIcon} from "../icons";

const ErrorBox = ({error}: {error: string | undefined}) => {
  const theme = useTheme();

  if (!error) return null;

  return (
    <Stack
      direction={"row"}
      sx={{
        alignItems: "center",
        bgcolor: "error.main",
        p: 1,
        borderRadius: 1,
        gap: 1,
        mb: 2,
      }}>
      <ErrorIcon
        htmlColor={theme.palette.error.contrastText}
        sx={{fontSize: 60}}
      />
      <Typography sx={{color: theme.palette.error.contrastText}}>
        {error}
      </Typography>
    </Stack>
  );
};

export {ErrorBox};
