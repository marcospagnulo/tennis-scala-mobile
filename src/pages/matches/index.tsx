import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/system";
import type {Period} from "../../domain/types";
import {useEffect, useState} from "react";
import {useAppContext} from "../../app/context";
import {MatchInfo} from "../../components/match";
import {Paper, Tab, Tabs, Typography} from "@mui/material";
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

  const formatPeriodLabel = (p: Period) => {
    const start = dayjs(p.start.toMillis()).format("DD MMM");
    const end = p.end ? dayjs(p.end.toMillis()).format("DD MMM") : "Oggi";
    return `${start} - ${end}`;
  };

  const matches = Object.values(period?.matches || {});
  const periods =
    currentSeason?.periods
      .sort((a, b) => b.start.toMillis() - a.start.toMillis())
      .map(p => ({
        label: formatPeriodLabel(p),
        value: p.start.toMillis(),
      })) || [];

  return (
    <Stack sx={{...sx, gap: 2, ...(mobile && {px: 2})}}>
      <Tabs
        variant="scrollable"
        value={period?.start.toMillis() ?? periods[0]?.value}
        onChange={(_e, value) => handleChange(value)}>
        {periods.map(p => (
          <Tab key={`period-tab-${p.value}`} label={p.label} value={p.value} />
        ))}
      </Tabs>
      {matches
        .sort((a, b) => a.date.toMillis() - b.date.toMillis())
        .map((m, index) => (
          <Paper
            key={`match-paper-${index}`}
            sx={{display: "flex", overflow: "hidden"}}>
            <MatchInfo match={m} expired={!!period?.end} />
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
            Non ci sono partite in questo periodo
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export {MatchesPage};
