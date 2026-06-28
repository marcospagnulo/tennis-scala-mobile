import {Female, Male} from "@mui/icons-material";
import {Avatar, Box, Stack} from "@mui/material";
import type {
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import type {Timestamp} from "firebase/firestore";

const getColumns = (downSm: boolean): GridColDef[] => [
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
  {field: "surname", headerName: "Cognome", flex: 1, minWidth: 150},
  {field: "name", headerName: "Nome", flex: 1, minWidth: 150},

  // column available only on larger screens
  ...(!downSm
    ? [
        {
          field: "birthDate",
          headerName: "Data di Nascita",
          hideable: true,
          flex: 1,
          minWidth: 120,
          valueGetter: (value: Timestamp) =>
            value ? dayjs(value.toDate()).format("DD/MM/YYYY") : "",
        },
        {
          field: "gender",
          headerName: "Sesso",
          width: 70,
          renderCell: (
            params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>,
          ) => (
            <Stack
              sx={{
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}>
              {params.value === "male" && <Male htmlColor="blue" />}
              {params.value === "female" && <Female htmlColor="pink" />}
            </Stack>
          ),
        },
        {field: "phone", headerName: "Telefono", flex: 1, minWidth: 70},
        {field: "email", headerName: "Email", flex: 1, minWidth: 150},
      ]
    : []),
];

export {getColumns};
