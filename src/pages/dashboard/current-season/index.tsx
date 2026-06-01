import {Stack, Typography} from "@mui/material";
import {useAppContext} from "../../../app/context";
import {SeasonIcon} from "../../../icons";
import {DashboardCard} from "../DashboardCard";
import dayjs from "dayjs";

const Row = ({label, value}: {label: string; value: string | number}) => (
  <Stack direction={"row"} spacing={2} sx={{height: 40, alignItems: "center"}}>
    <Typography variant="body1" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="body1" color="textPrimary">
      {value}
    </Typography>
  </Stack>
);

const CurrentSeasonCard = ({direction}: {direction?: "row" | "column"}) => {
  const {currentSeason} = useAppContext();

  return (
    <DashboardCard
      direction={direction}
      image={
        <Stack
          sx={{
            bgcolor: "primary.dark",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <SeasonIcon color="secondary" sx={{width: "80%", height: "80%"}} />
        </Stack>
      }
      content={
        <Stack sx={{minHeight: 176, flex: 1, px: 2}}>
          {currentSeason ? (
            <>
              <Typography variant="h5" sx={{my: 1}}>
                {currentSeason.name}
              </Typography>
              <Row label="Partecipanti" value={currentSeason.ranking.length} />
              <Row label="Periodi" value={currentSeason.periods.length} />
              <Row
                label="Inizio"
                value={dayjs(currentSeason.start.toDate()).format(
                  "D MMMM YYYY",
                )}
              />
              <Row
                label="Fine"
                value={dayjs(currentSeason.end.toDate()).format("D MMMM YYYY")}
              />
            </>
          ) : (
            <Typography variant="h5">Nessuna stagione corrente</Typography>
          )}
        </Stack>
      }
    />
  );
};

export {CurrentSeasonCard};
