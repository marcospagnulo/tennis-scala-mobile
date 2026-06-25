import type {Theme} from "@emotion/react";
import {Stack, type SxProps} from "@mui/system";
import type {Period} from "../../domain/types";
import {useEffect, useState} from "react";
import {useAppContext} from "../../app/context";
import {MatchInfo} from "../../components/match";
import {Divider, Paper, Tab, Tabs, Typography} from "@mui/material";
import dayjs from "dayjs";
import {MatchIcon} from "../../icons";
import {AddMatch} from "./AddMatch";

const MatchesPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const {currentSeason, mobile} = useAppContext();
  const [selectedPeriodStart, setSelectedPeriodStart] = useState<number>();

  useEffect(() => {
    if (!currentSeason?.periods?.length) {
      setSelectedPeriodStart(undefined);
      return;
    }

    const hasSelectedPeriod = currentSeason.periods.some(
      p => p.start.toMillis() === selectedPeriodStart,
    );
    if (hasSelectedPeriod) {
      return;
    }

    let activePeriod = currentSeason.periods.find(p => !p.end);
    if (!activePeriod) {
      activePeriod = currentSeason.periods[0];
    }
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
  const period = currentSeason?.periods?.find(
    p => p.start.toMillis() === selectedPeriodStart,
  );
  const matches = Object.values(period?.matches || {});

  return (
    <Paper
      elevation={mobile ? 0 : 1}
      sx={{
        ...sx,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        my: mobile ? 0 : 2,
      }}>
      {periods.length > 0 && (
        <Tabs
          variant="scrollable"
          value={period?.start.toMillis() ?? periods[0]?.value}
          onChange={(_e, value) => handleChange(value)}>
          {periods.map(p => (
            <Tab
              key={`period-tab-${p.value}`}
              label={p.label}
              value={p.value}
            />
          ))}
        </Tabs>
      )}
      <Stack
        sx={{
          flex: "1 1 0",
          overflow: "auto",
          pb: 2,
          ...(mobile && {pb: matches.length > 0 ? 10 : 2}),
          ...(matches.length === 0 && {
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }),
        }}>
        {matches.length > 0 && (
          <Stack divider={<Divider />}>
            {[
              ...matches
                .sort((a, b) => a.date.toMillis() - b.date.toMillis())
                .map((m, index) => (
                  <Stack
                    key={`match-paper-${index}`}
                    sx={{display: "flex", overflow: "hidden"}}>
                    <MatchInfo match={m} expired={!!period?.end} />
                  </Stack>
                )),
            ]}
          </Stack>
        )}

        {matches.length === 0 && (
          <>
            <MatchIcon color="primary" sx={{fontSize: mobile ? 120 : 180}} />
            <Typography
              variant={mobile ? "h6" : "h5"}
              color="text.secondary"
              align="center">
              {currentSeason?.periods
                ? "Non ci sono partite in questo periodo"
                : "Nessun periodo disponibile"}
            </Typography>
          </>
        )}
      </Stack>
      {currentSeason?.periods && <AddMatch />}
    </Paper>
  );
};

export {MatchesPage};
