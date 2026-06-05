import {Engineering} from "@mui/icons-material";
import {DashboardCard} from "../DashboardCard";
import {Button, Stack} from "@mui/material";
import {SeasonIcon} from "../../../icons";
import {SeasonsDialog} from "./season";
import {useState} from "react";
import {useAppContext} from "../../../app/context";

const AdminCard = ({direction}: {direction?: "row" | "column"}) => {
  const {user} = useAppContext();
  const [seasonsDialogOpen, setSeasonsDialogOpen] = useState<boolean>(false);

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
        <Stack
          direction={"row"}
          spacing={2}
          sx={{justifyContent: "space-between", alignItems: "center", p: 2}}>
          <Button
            variant="contained"
            sx={{flexDirection: "column", gap: 2, p: 2}}
            onClick={() => setSeasonsDialogOpen(true)}>
            <SeasonIcon sx={{fontSize: 50}} />
            Stagioni
          </Button>

          <SeasonsDialog
            open={seasonsDialogOpen}
            onClose={() => setSeasonsDialogOpen(false)}
          />
        </Stack>
      }
    />
  );
};

export {AdminCard};
