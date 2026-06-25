import {ButtonBase, Dialog, Stack, Typography} from "@mui/material";
import dayjs from "dayjs";
import type {Match, Season} from "../../domain/types";
import {EditIcon} from "../../icons";
import {useEffect, useState} from "react";
import {StaticDateTimePicker} from "@mui/x-date-pickers";
import {useUpdateMatch} from "../../functions";
import {CanManageSeason} from "../CanManageSeason";

const MatchDate = ({season, match}: {season: Season; match: Match}) => {
  const [hover, setHover] = useState(false);
  const [dialog, setDialog] = useState(false);

  const {success, clear, updateMatchDate} = useUpdateMatch();

  useEffect(() => {
    if (success) {
      clear();
    }
  }, [success, clear]);

  const handleChangeDate = async (date: dayjs.Dayjs | null) => {
    if (!date) return;
    setDialog(false);
    updateMatchDate(season, match.id, date.toDate());
  };

  const handleEditClick = () => {
    setDialog(true);
    setHover(false);
  };

  return (
    <Stack
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        height: "100%",
        minWidth: 60,
        py: 0.5,
        gap: 0.5,
        position: "relative",
      }}>
      <Typography variant="h5">
        {dayjs(match.date.toDate()).format("D")}
      </Typography>
      <Typography variant="body2" sx={{textTransform: "capitalize"}}>
        {dayjs(match.date.toDate()).format("MMM")}
      </Typography>
      <Typography variant="body2">
        {dayjs(match.date.toDate()).format("HH:mm")}
      </Typography>
      <CanManageSeason>
        <ButtonBase
          sx={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            position: "absolute",
            bgcolor: "primary.main",
            visibility: hover ? "visible" : "hidden",
          }}
          onClick={handleEditClick}>
          <EditIcon color="secondary" fontSize="medium" />
        </ButtonBase>
        <Dialog open={dialog} onClose={() => setDialog(false)}>
          <StaticDateTimePicker
            defaultValue={dayjs(match.date.toDate())}
            onAccept={handleChangeDate}
          />
        </Dialog>
      </CanManageSeason>
    </Stack>
  );
};

export {MatchDate};
