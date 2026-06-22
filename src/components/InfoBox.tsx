import {
  Stack,
  Typography,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import {Info} from "@mui/icons-material";

const InfoBox = ({
  message,
  invert,
  sx,
}: {
  message: string | undefined;
  invert?: boolean;
  sx?: SxProps<Theme>;
}) => {
  const theme = useTheme();

  if (!message) return null;

  return (
    <Stack
      direction={"row"}
      sx={{
        alignItems: "center",
        border: `1px solid ${theme.palette.primary.dark}`,
        ...(invert && {backgroundColor: theme.palette.primary.dark}),
        p: 1,
        borderRadius: 1,
        gap: 1,
        mb: 2,
        ...sx,
      }}>
      <Info
        color={invert ? "inherit" : "primary"}
        sx={{fontSize: 40, ...(invert && {color: "#fff"})}}
      />
      <Typography sx={{color: invert ? "#fff" : "textPrimary"}}>
        {message}
      </Typography>
    </Stack>
  );
};

export {InfoBox};
