import {Avatar, Box} from "@mui/material";
import type {GridColDef} from "@mui/x-data-grid";

const columns: GridColDef[] = [
  {
    field: "avatar",
    headerName: "",
    width: 80,
    renderCell: params => {
      return (
        <Box sx={{mt: 0.5}}>
          <Avatar
            src={params.row.avatar}
            alt="Avatar"
            sx={{width: 40, height: 40}}
          />
        </Box>
      );
    },
  },
  {field: "surname", headerName: "Cognome", flex: 1},
  {field: "name", headerName: "Nome", flex: 1},
];

export {columns};
