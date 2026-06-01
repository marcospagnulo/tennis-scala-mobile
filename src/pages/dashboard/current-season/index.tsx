import {Typography} from "@mui/material";
import {useAppContext} from "../../../app/context";
import {SeasonIcon} from "../../../icons";
import {DashboardCard} from "../DashboardCard";

const CurrentSeasonCard = () => {
  const {currentSeason} = useAppContext();
  return (
    <DashboardCard
      image={
        <SeasonIcon color="secondary" sx={{width: "100%", height: "100%"}} />
      }
      content={
        <Typography variant="h5" sx={{p: 2}}>
          {currentSeason?.name}
        </Typography>
      }
    />
  );
};

export {CurrentSeasonCard};
