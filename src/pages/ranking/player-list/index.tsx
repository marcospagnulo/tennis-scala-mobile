import {Button, Stack, TextField, type SxProps} from "@mui/material";
import type {Player, queryFilter, querySort} from "../../../domain/types";
import {useQueryCollection} from "../../../functions/useQueryCollection";
import {collections} from "../../../lib/firebase";
import {useEffect, useState} from "react";
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
  onSelect,
}: {
  sx?: SxProps<Theme>;
  onSelect: (players: Player[]) => void;
}) => {
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [queryText, setQueryText] = useState<string>("");
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0],
  });
  const [sort] = useState<querySort[]>([{field: "surname", sort: "asc"}]);
  const [filters, setFilters] = useState<queryFilter[]>([]);

  useEffect(() => {
    if (queryText.trim().length > 2) {
      setFilters([
        {
          fieldPath: "surname",
          opStr: ">=",
          value: queryText,
        },
        {
          fieldPath: "surname",
          opStr: "<",
          value: queryText + "~",
        },
      ]);
    } else {
      setFilters([]);
    }
  }, [queryText]);

  const {items, loading, rowCount} = useQueryCollection({
    collection: collections?.players,
    pagination,
    filters,
    sort,
  });

  const handleConfirm = () => {
    const selectedPlayers: Player[] = [];
    selection?.ids.forEach(id => {
      const selected = items.find(item => item.id === id);
      if (selected) selectedPlayers.push(selected);
    });
    onSelect(selectedPlayers);
  };

  const handleSelection = (newSelection: GridRowSelectionModel) => {
    setSelection(newSelection);
  };

  return (
    <Stack sx={{...sx, gap: 2, mt: 1}}>
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
        disableRowSelectionExcludeModel
        onRowSelectionModelChange={handleSelection}
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
          disabled={selection.ids.size === 0}>
          Coferma
        </Button>
      </Stack>
    </Stack>
  );
};

export {PlayerList};
