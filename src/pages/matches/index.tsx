import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/system";
import type {Period} from "../../domain/types";
import {useEffect, useState} from "react";
import {useAppContext} from "../../app/context";
import {MatchInfo} from "../../components/match";
import {Paper, Typography} from "@mui/material";
import {Select} from "../../components/Select";
import dayjs from "dayjs";
import {MatchIcon} from "../../icons";

const MatchesPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const {currentSeason, mobile} = useAppContext();
  const [period, setPeriod] = useState<Period>();

  useEffect(() => {
    const activePeriod = currentSeason?.periods.find(p => !p.end);
    setPeriod(activePeriod);
  }, [currentSeason]);

  const handleChange = (value: number) => {
    const selectedPeriod = currentSeason?.periods.find(
      p => p.start.toMillis() === value,
    );
    setPeriod(selectedPeriod);
  };

  const matches = Object.values(period?.matches || {});

  return (
    <Stack sx={{...sx, py: 2, gap: 2, ...(mobile && {px: 2})}}>
      <Select<number>
        value={period?.start.toMillis() ?? 0}
        onChange={handleChange}
        options={
          currentSeason?.periods.map(p => ({
            label: `Periodo ${dayjs(p.start.toMillis()).format("DD/MM")}`,
            value: p.start.toMillis(),
          })) || []
        }
      />
      {matches
        .sort((a, b) => a.date.toMillis() - b.date.toMillis())
        .map((m, index) => (
          <Paper
            key={`match-paper-${index}`}
            sx={{display: "flex", overflow: "hidden"}}>
            <MatchInfo match={m} />
          </Paper>
        ))}

      {matches.length === 0 && (
        <Stack
          sx={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}>
          <MatchIcon sx={{fontSize: 180, color: "text.secondary"}} />
          <Typography variant="h6" color="text.secondary">
            Non sono state concluse partite in questo periodo
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export {MatchesPage};
