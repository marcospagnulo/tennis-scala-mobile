import {DoneAll, Engineering, Settings} from "@mui/icons-material";
import {DashboardCard} from "../DashboardCard";
import {Box, Button, Stack} from "@mui/material";
import {MatchIcon, SeasonIcon} from "../../../icons";
import {SeasonsDialog} from "./season";
import {useEffect, useState} from "react";
import {useAppContext} from "../../../app/context";
import {ConfirmDialog, ErrorDialog} from "../../../components";
import {useClosePeriod} from "../../../functions/ranking/useClosePeriod";

const AdminCard = ({direction}: {direction?: "row" | "column"}) => {
  const {user, currentSeason, currentSeasonExpired} = useAppContext();
  const {
    success,
    error,
    closePeriod,
    clear,
    loading: closePeriodLoading,
  } = useClosePeriod();

  const [seasonsDialogOpen, setSeasonsDialogOpen] = useState<boolean>(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (success) {
      clear();
    }
  }, [success, clear]);

  const handleConfirmClosePeriod = () => {
    if (currentSeason) {
      closePeriod(currentSeason);
    }
    setPeriodDialogOpen(false);
  };

  if (!user || user.role !== "admin") return null;

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
        <Stack direction={"row"} spacing={2} sx={{alignItems: "center", p: 2}}>
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
            Stagioni
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={
              !currentSeason || closePeriodLoading || currentSeasonExpired
            }
            sx={{flexDirection: "column", gap: 2, p: 2, flex: 1}}
            onClick={() => setPeriodDialogOpen(true)}>
            <Box sx={{position: "relative", width: 50, height: 50}}>
              <DoneAll sx={{position: "absolute", top: 0, left: 0}} />
              <MatchIcon
                sx={{fontSize: 40, position: "absolute", bottom: 0, right: 0}}
              />
            </Box>
            Chiudi periodo
          </Button>

          <SeasonsDialog
            open={seasonsDialogOpen}
            onClose={() => setSeasonsDialogOpen(false)}
          />

          <ConfirmDialog
            open={periodDialogOpen}
            title="Chiudi periodo"
            content="Sei sicuro di voler chiudere il periodo? Questa azione è irreversibile e non potrà essere annullata."
            onConfirm={handleConfirmClosePeriod}
            onClose={() => setPeriodDialogOpen(false)}
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
