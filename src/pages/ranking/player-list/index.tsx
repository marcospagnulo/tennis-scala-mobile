import {Button, Stack, TextField, type SxProps} from "@mui/material";
import type {Player, queryFilter, querySort} from "../../../domain/types";
import {useQueryCollection} from "../../../hooks/useQueryCollection";
import {collections} from "../../../lib/firebase";
import {useState} from "react";
import type {
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import type {Theme} from "@emotion/react";
import {DataGrid} from "@mui/x-data-grid";
import {columns} from "./columns";
import {Search} from "@mui/icons-material";

const pageSizeOptions = [25, 50, 100];
const PlayerList = ({
  sx,
  filters,
  onSelect,
}: {
  sx?: SxProps<Theme>;
  filters?: queryFilter[];
  onSelect: (players: Player[]) => void;
}) => {
  const [selection, setSelection] = useState<GridRowSelectionModel>();
  const [queryText, setQueryText] = useState<string>("");
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0],
  });
  const [sort] = useState<querySort[]>([{field: "surname", direction: "asc"}]);

  const {items, loading, rowCount} = useQueryCollection({
    collection: collections?.players,
    pagination,
    filters,
    sort,
    queryText,
  });

  const handleConfirm = () => {
    const selectedPlayers: Player[] = [];
    selection?.ids.forEach(id => {
      const selected = items.find(item => item.id === id);
      if (selected) selectedPlayers.push(selected);
    });
    onSelect(selectedPlayers);
  };

  return (
    <Stack sx={{...sx}}>
      <TextField
        sx={{"& input": {p: 1}}}
        onChange={e => setQueryText(e.target.value)}
        slotProps={{input: {startAdornment: <Search />}}}
      />
      <DataGrid
        sx={{border: "none", height: "100%"}}
        loading={loading}
        disableColumnMenu={true}
        rows={items}
        columns={columns}
        pagination
        checkboxSelection
        onRowSelectionModelChange={setSelection}
        rowSelectionModel={selection}
        paginationMode="server"
        rowCount={rowCount}
        pageSizeOptions={pageSizeOptions}
        paginationModel={pagination}
        onPaginationModelChange={newModel => setPagination(newModel)}
      />
      <Stack direction="row" sx={{mt: 2, justifyContent: "flex-end"}}>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selection}>
          Coferma
        </Button>
      </Stack>
    </Stack>
  );
};

export {PlayerList};
