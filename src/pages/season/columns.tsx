import type {GridColDef} from "@mui/x-data-grid";
import dayjs from "dayjs";
import type {Timestamp} from "firebase/firestore";
import type {Season} from "../../domain/types";

const columns: GridColDef<Season>[] = [
  {field: "name", headerName: "Nome", flex: 1},
  {
    field: "startDate",
    headerName: "Data di Inizio",
    flex: 1,
    valueGetter: (value: Timestamp) =>
      value ? dayjs(value.toDate()).format("DD/MM/YYYY") : "",
  },
  {field: "weeks", headerName: "Settimane", flex: 1},
];

export {columns};
