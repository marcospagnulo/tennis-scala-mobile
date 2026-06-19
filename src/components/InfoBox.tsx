import {Stack, Typography, useTheme} from "@mui/material";
import {Info} from "@mui/icons-material";

const InfoBox = ({message}: {message: string | undefined}) => {
  const theme = useTheme();

  if (!message) return null;

  return (
    <Stack
      direction={"row"}
      sx={{
        alignItems: "center",
        border: `1px solid ${theme.palette.primary.main}`,
        p: 1,
        borderRadius: 1,
        gap: 1,
        mb: 2,
      }}>
      <Info color="primary" sx={{fontSize: 40}} />
      <Typography color="textPrimary">{message}</Typography>
    </Stack>
  );
};

export {InfoBox};
