import {PlayArrow} from "@mui/icons-material";
import {Stack, Typography} from "@mui/material";
import {green, red} from "@mui/material/colors";

const DiffPosition = ({
  position,
  livePosition,
  big,
}: {
  position: number;
  livePosition?: number;
  big?: boolean;
}) => {
  if (!livePosition || livePosition === position) return null;

  const diff = position - livePosition;
  const isPositive = diff > 0;

  return (
    <Stack sx={{position: "relative"}}>
      {isPositive ? (
        <PlayArrow
          sx={{
            color: green[500],
            fontSize: big ? 24 : 12,
            transform: "rotate(-90deg)",
          }}
        />
      ) : (
        <PlayArrow
          sx={{
            color: red[500],
            fontSize: big ? 24 : 12,
            transform: "rotate(90deg)",
          }}
        />
      )}
      <Typography
        variant={big ? "body2" : "caption"}
        align="center"
        sx={{color: isPositive ? green[500] : red[500], lineHeight: 1}}>
        {isPositive ? `+${diff}` : diff}
      </Typography>
    </Stack>
  );
};

export {DiffPosition};
