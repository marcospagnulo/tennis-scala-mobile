import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/system";
import type {Period} from "../../domain/types";
import {useEffect, useState} from "react";
import {useAppContext} from "../../app/context";
import {MatchInfo} from "../../components/match";
import {Paper, Tab, Tabs, Typography} from "@mui/material";
import dayjs from "dayjs";
import {MatchIcon} from "../../icons";
import {AddMatch} from "./AddMatch";

const MatchesPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const {currentSeason, mobile} = useAppContext();
  const [selectedPeriodStart, setSelectedPeriodStart] = useState<number>();

  useEffect(() => {
    if (!currentSeason?.periods.length) {
      setSelectedPeriodStart(undefined);
      return;
    }

    const hasSelectedPeriod = currentSeason.periods.some(
      p => p.start.toMillis() === selectedPeriodStart,
    );
    if (hasSelectedPeriod) {
      return;
    }

    const activePeriod = currentSeason.periods.find(p => !p.end);
    setSelectedPeriodStart(activePeriod?.start.toMillis());
  }, [currentSeason, selectedPeriodStart]);

  const handleChange = (value: number) => {
    setSelectedPeriodStart(value);
  };

  const formatPeriodLabel = (p: Period) => {
    const start = dayjs(p.start.toMillis()).format("DD MMM");
    const end = p.end ? dayjs(p.end.toMillis()).format("DD MMM") : "Oggi";
    return `${start} - ${end}`;
  };

  const periods = [...(currentSeason?.periods ?? [])]
    .sort((a, b) => b.start.toMillis() - a.start.toMillis())
    .map(p => ({
      label: formatPeriodLabel(p),
      value: p.start.toMillis(),
    }));
  const period = currentSeason?.periods.find(
    p => p.start.toMillis() === selectedPeriodStart,
  );
  const matches = Object.values(period?.matches || {});

  return (
    <Stack sx={{...sx, gap: 2}}>
      <Tabs
        variant="scrollable"
        value={period?.start.toMillis() ?? periods[0]?.value}
        onChange={(_e, value) => handleChange(value)}>
        {periods.map(p => (
          <Tab key={`period-tab-${p.value}`} label={p.label} value={p.value} />
        ))}
      </Tabs>
      <Stack
        sx={{
          flex: "1 1 0",
          overflow: "auto",
          pb: 2,
          ...(mobile && {px: 2, pb: matches.length > 0 ? 10 : 2}),
          ...(matches.length === 0 && {
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }),
        }}>
        {matches.length > 0 && (
          <Stack spacing={2}>
            {[
              ...matches
                .sort((a, b) => a.date.toMillis() - b.date.toMillis())
                .map((m, index) => (
                  <Paper
                    key={`match-paper-${index}`}
                    sx={{display: "flex", overflow: "hidden"}}>
                    <MatchInfo match={m} expired={!!period?.end} />
                  </Paper>
                )),
            ]}
          </Stack>
        )}

        {matches.length === 0 && (
          <>
            <MatchIcon color="primary" sx={{fontSize: 180}} />
            <Typography variant="h5" color="text.secondary" align="center">
              Non ci sono partite in questo periodo
            </Typography>
          </>
        )}
      </Stack>
      <AddMatch />
    </Stack>
  );
};

export {MatchesPage};
