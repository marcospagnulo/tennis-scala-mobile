import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  type SvgIconProps,
  type SxProps,
} from "@mui/material";
import {useState, type ReactNode} from "react";
import {
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
  type UpdateData,
  type WithFieldValue,
} from "firebase/firestore";
import {
  DataGrid,
  GridActionsCell,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import type {Theme} from "@emotion/react";
import {AddIcon, EditIcon, DeleteIcon} from "../icons";
import {useAppContext} from "../app/context";
import {Search} from "@mui/icons-material";
import {useQueryCollection} from "../functions/useQueryCollection";
import {ConfirmDialog} from "./ConfirmDialog";
import type {queryPage, querySort} from "../domain/types";

export interface Entity {
  id: string | undefined;
  [key: string]: any;
}

interface CrudProps<T extends Entity> {
  title: string;
  collection: CollectionReference<T, T>;
  columns: GridColDef<T>[];
  sx?: SxProps<Theme>;
  sort?: querySort[];
  rules: {
    canAdd: boolean;
    canEdit: (row: T) => boolean;
    canDelete: (row: T) => boolean;
  };
  actions?: {
    icon: React.ElementType<SvgIconProps>;
    label: string;
    onClick: (item: T) => void;
  }[];
  form: (
    formData: Partial<T>,
    handleChange: (key: keyof Partial<T>, value: any) => void,
    handleFileLoad: (evt: React.ChangeEvent<HTMLInputElement>) => void,
  ) => ReactNode;
  initialFormData: Partial<T>;
}

const pageSizeOptions = [25, 50, 100];
const Crud = <T extends Entity>({
  sx,
  collection,
  columns: initialColumns,
  title,
  form: Form,
  initialFormData,
  actions,
  rules,
  sort: initialSort,
}: CrudProps<T>) => {
  const {mobile} = useAppContext();

  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>(initialFormData);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [queryText, setQueryText] = useState<string>("");
  const [sort, setSort] = useState<readonly querySort[] | undefined>(
    initialSort,
  );
  const [pagination, setPagination] = useState<queryPage>({
    page: 0,
    pageSize: pageSizeOptions[0],
  });

  const {items, loading, rowCount, refetch} = useQueryCollection({
    collection,
    queryText,
    pagination,
    sort,
  });

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const text = evt.target.value;
    setQueryText(text);
  };

  const handleEditItem = (item: T) => {
    setSelectedItem(item);
    setFormData(item);
    setOpenFormDialog(true);
  };

  const handleAddClick = () => {
    setSelectedItem(null);
    setFormData(initialFormData);
    setOpenFormDialog(true);
  };

  const handleChange = (key: keyof Partial<T>, value: any) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedItem(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (selectedItem) {
      const itemDoc = doc(collection, selectedItem.id);
      await updateDoc(itemDoc, formData as UpdateData<T>);
      refetch();
    } else {
      const doc = {
        ...formData,
        createdAt: serverTimestamp(),
      } as WithFieldValue<T>;
      await addDoc(collection, doc);
      refetch();
    }
    handleCloseFormDialog();
  };

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteDoc(doc(collection, itemToDelete.id));
    refetch();
    handleCloseDeleteDialog();
  };

  const columns = [...initialColumns];
  const actionsCount = 2 + (actions ? actions.length : 0);
  const actionswidth = 48 * actionsCount;
  columns.push({
    field: "actions",
    headerName: "",
    type: "actions",
    sortable: false,
    width: actionswidth,
    renderCell: params => {
      return (
        <GridActionsCell {...params}>
          {actions?.map(action => {
            const Icon = action.icon;
            return (
              <GridActionsCellItem
                key={action.label}
                icon={<Icon fontSize="small" />}
                label={action.label}
                onClick={() => action.onClick(params.row as T)}
              />
            );
          })}
          {rules.canEdit(params.row as T) && (
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" color="primary" />}
              label="Edit"
              onClick={() => handleEditItem(params.row as T)}
            />
          )}
          {rules.canDelete(params.row as T) && (
            <GridActionsCellItem
              icon={<DeleteIcon fontSize="small" color="error" />}
              label="Delete"
              onClick={() => handleDeleteClick(params.row as T)}
            />
          )}
        </GridActionsCell>
      );
    },
  });

  const handleFileLoad = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileUpload = evt.target.files?.item(0);
    if (fileUpload) {
      const reader = new FileReader();
      reader.readAsDataURL(fileUpload);
      reader.onload = () => {
        const base64 = reader.result;
        setFormData(prev => ({...prev, avatar: base64 as string}));
      };
    }
  };

  return (
    <Stack sx={{...sx}}>
      <Paper
        sx={{
          flex: "1 1 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
        <Stack
          direction={"row"}
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            mx: 2,
            mt: 2,
          }}>
          <TextField
            sx={{"& input": {p: 1}}}
            onChange={handleSearch}
            slotProps={{input: {startAdornment: <Search />}}}
          />
          {rules.canAdd && (
            <IconButton
              onClick={handleAddClick}
              size="small"
              sx={{
                "&, &:hover": {
                  backgroundColor: theme => theme.palette.primary.main,
                },
              }}>
              <AddIcon fontSize="inherit" sx={{color: "white"}} />
            </IconButton>
          )}
        </Stack>
        <DataGrid
          sx={{
            border: "none",
            height: "100%",
            translate: {},
            ...(mobile && {
              "& .MuiTablePagination-toolbar": {
                justifyContent: "space-between",
              },
              "& .MuiTablePagination-spacer": {display: "none"},
            }),
          }}
          loading={loading}
          disableColumnMenu={true}
          rows={items}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          sortModel={sort}
          pageSizeOptions={pageSizeOptions}
          onSortModelChange={setSort}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          localeText={{
            noResultsOverlayLabel: "Nessun risultato",
            noRowsLabel: "Nessun dato",
            paginationDisplayedRows: parmas =>
              `${parmas.from}-${parmas.to} di ${parmas.count}`,
          }}
        />
      </Paper>
      <Dialog open={openFormDialog} onClose={handleCloseFormDialog}>
        <DialogTitle>
          {selectedItem ? `Modifica ${title}` : `Nuovo ${title}`}
        </DialogTitle>
        <DialogContent>
          {Form(formData, handleChange, handleFileLoad)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salva
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={openDeleteDialog}
        title="Conferma Eliminazione"
        content={`Sei sicuro di voler eliminare "${itemToDelete?.name}"?`}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </Stack>
  );
};

export {Crud};
