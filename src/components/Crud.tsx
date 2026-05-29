import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
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
  type GridPaginationModel,
} from "@mui/x-data-grid";
import type {Theme} from "@emotion/react";
import {AddIcon, EditIcon, DeleteIcon} from "../icons";
import {useAppContext} from "../app/context";
import {Search} from "@mui/icons-material";
import {useQueryCollection} from "../hooks/useQueryCollection";

export interface Entity {
  id: string | undefined;
  [key: string]: any;
}

interface CrudProps<T extends Entity> {
  sx?: SxProps<Theme>;
  collection: CollectionReference<T, T>;
  columns: GridColDef<T>[];
  title: string;
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
export function Crud<T extends Entity>({
  sx,
  collection,
  columns: initialColumns,
  title,
  form: Form,
  initialFormData,
  actions,
}: CrudProps<T>) {
  const {user} = useAppContext();

  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>(initialFormData);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [queryText, setQueryText] = useState<string>("");
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0],
  });

  const {items, loading, rowCount, refetch} = useQueryCollection({
    collection,
    pagination,
    queryText,
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
  if (user?.role === "admin") {
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
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" color="primary" />}
              label="Edit"
              onClick={() => handleEditItem(params.row as T)}
            />
            <GridActionsCellItem
              icon={<DeleteIcon fontSize="small" color="error" />}
              label="Delete"
              onClick={() => handleDeleteClick(params.row as T)}
            />
          </GridActionsCell>
        );
      },
    });
  }

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
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Paper
        sx={{
          flex: "1 1 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
        <Stack
          direction={"row"}
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
          {user?.role === "admin" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              aria-label="add"
              onClick={handleAddClick}>
              Nuovo
            </Button>
          )}
        </Stack>
        <DataGrid
          sx={{border: "none", height: "100%"}}
          loading={loading}
          disableColumnMenu={true}
          rows={items}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          pageSizeOptions={pageSizeOptions}
          paginationModel={pagination}
          onPaginationModelChange={newModel => setPagination(newModel)}
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
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare "{itemToDelete?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annulla</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
