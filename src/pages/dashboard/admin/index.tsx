import {Engineering, Lock, Settings} from "@mui/icons-material";
import {DashboardCard} from "../DashboardCard";
import {Box, Button, Stack, Typography, type SxProps} from "@mui/material";
import {AddIcon, MatchIcon, SeasonIcon} from "../../../icons";
import {SeasonsDialog} from "./season";
import {useEffect, useState} from "react";
import {useAppContext} from "../../../app/context";
import {ConfirmDialog, ErrorDialog} from "../../../components";
import {usePeriod} from "../../../functions/ranking/usePeriod";
import type {Theme} from "@emotion/react";
import {useAuthorization} from "../../../hooks/useAuthorization";

const AdminCard = ({direction}: {direction?: "row" | "column"}) => {
  const {currentSeason, currentSeasonExpired, mobile} = useAppContext();
  const {
    success,
    error,
    closePeriod,
    openPeriod,
    clear,
    loading: periodLoading,
  } = usePeriod();
  const {isAdmin, isManager, canManageSeason} = useAuthorization();

  const [seasonsDialogOpen, setSeasonsDialogOpen] = useState<boolean>(false);
  const [closePeriodDialogOpen, setClosePeriodDialogOpen] =
    useState<boolean>(false);
  const [openPeriodDialogOpen, setOpenPeriodDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (success) {
      clear();
    }
  }, [success, clear]);

  const handleConfirmClosePeriod = () => {
    if (currentSeason) {
      closePeriod(currentSeason);
    }
    setClosePeriodDialogOpen(false);
  };

  const handleConfirmNewPeriod = () => {
    if (currentSeason) {
      openPeriod(currentSeason);
    }
    setOpenPeriodDialogOpen(false);
  };

  const truncateSx: SxProps<Theme> = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  };

  if (!isAdmin && !isManager) return null;

  const currentPeriod = currentSeason?.periods?.find(p => !p.end);

  const disableClosePeriod =
    periodLoading ||
    !canManageSeason ||
    !currentPeriod ||
    Object.keys(currentPeriod.matches).length === 0;

  const disableNewPeriod =
    periodLoading ||
    !canManageSeason ||
    currentSeasonExpired ||
    (currentPeriod && Object.keys(currentPeriod.matches).length === 0);

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
          <Engineering color="secondary" sx={{width: "70%", height: "70%"}} />
        </Stack>
      }
      content={
        <Stack
          direction={mobile ? "column" : "row"}
          spacing={2}
          sx={{alignItems: mobile ? "" : "center", p: 2}}>
          <Button
            variant="contained"
            sx={{flexDirection: "column", gap: 2, p: 2, flex: 1}}
            onClick={() => setSeasonsDialogOpen(true)}>
            <Box sx={{position: "relative", width: 50, height: 50}}>
              <Settings
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  border: "2px solid",
                  borderColor: "primary.main",
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
              <SeasonIcon
                sx={{fontSize: 40, position: "absolute", bottom: 0, right: 0}}
              />
            </Box>
            <Typography sx={{...truncateSx}} variant="body2">
              Stagioni
            </Typography>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={disableClosePeriod}
            sx={{flexDirection: "column", gap: 2, p: 2, flex: 1}}
            onClick={() => setClosePeriodDialogOpen(true)}>
            <Box sx={{position: "relative", width: 50, height: 50}}>
              <Lock sx={{position: "absolute", top: 0, left: 0}} />
              <MatchIcon
                sx={{fontSize: 40, position: "absolute", bottom: 0, right: 0}}
              />
            </Box>
            <Typography sx={{...truncateSx}} variant="body2">
              Chiudi periodo
            </Typography>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={disableNewPeriod}
            sx={{flexDirection: "column", gap: 2, p: 2, flex: 1}}
            onClick={() => setOpenPeriodDialogOpen(true)}>
            <Box sx={{position: "relative", width: 50, height: 50}}>
              <AddIcon sx={{position: "absolute", top: 0, left: 0}} />
              <MatchIcon
                sx={{fontSize: 40, position: "absolute", bottom: 0, right: 0}}
              />
            </Box>
            <Typography sx={{...truncateSx}} variant="body2">
              Nuovo periodo
            </Typography>
          </Button>

          <SeasonsDialog
            open={seasonsDialogOpen}
            onClose={() => setSeasonsDialogOpen(false)}
          />

          <ConfirmDialog
            open={closePeriodDialogOpen}
            title="Chiudi periodo"
            content="Sei sicuro di voler chiudere il periodo? Questa azione è irreversibile e non potrà essere annullata."
            onConfirm={handleConfirmClosePeriod}
            onClose={() => setClosePeriodDialogOpen(false)}
          />

          <ConfirmDialog
            open={openPeriodDialogOpen}
            title="Apri nuovo periodo"
            content="Sei sicuro di voler aprire un nuovo periodo? Questa azione chiuderà il periodo attuale e ne aprirà uno nuovo."
            onConfirm={handleConfirmNewPeriod}
            onClose={() => setOpenPeriodDialogOpen(false)}
          />

          <ErrorDialog
            open={!!error}
            title="Errore"
            content={
              error ??
              "Si è verificato un errore sconosciuto durante la chiusura del periodo."
            }
            onClose={() => clear()}
          />
        </Stack>
      }
    />
  );
};

export {AdminCard};
