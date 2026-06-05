import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/system";
import type {Period} from "../../domain/types";
import {useEffect, useState} from "react";
import {useAppContext} from "../../app/context";
import {MatchInfo} from "../../components/match";
import {Paper} from "@mui/material";
import {Select} from "../../components/Select";
import dayjs from "dayjs";

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
      {Object.values(period?.matches || {}).map((m, index) => (
        <Paper key={`match-paper-${index}`} sx={{p: 2}}>
          <MatchInfo match={m} readonly />
        </Paper>
      ))}
    </Stack>
  );
};

export {MatchesPage};
