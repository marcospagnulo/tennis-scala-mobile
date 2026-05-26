import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  type SxProps,
} from "@mui/material";
import {useEffect, useState, type ReactNode} from "react";
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
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
import { useAppContext } from "../app/context";

export interface Entity {
  id: string;
  [key: string]: any;
}

interface CrudProps<T extends Entity> {
  sx?: SxProps<Theme>;
  collection: CollectionReference<T, T>;
  columns: GridColDef<T>[];
  title: string;
  actions?: {
    icon: React.ReactNode;
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
  
  const [items, setItems] = useState<T[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<Partial<T>>(initialFormData);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection,
      snapshot => {
        const data = snapshot.docs.map(
          doc => ({...doc.data(), id: doc.id}) as T,
        );
        setItems(data);
        setLoading(false);
      },
      error => {
        console.error("Error fetching data: ", error);
        setLoading(false);
      },
      () => {
        console.log("Real-time listener unsubscribed");
      },
    );
    return () => unsubscribe();
  }, [collection]);

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
    } else {
      const doc = {
        ...formData,
        createdAt: serverTimestamp(),
      } as WithFieldValue<T>;
      await addDoc(collection, doc);
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
            {actions?.map(action => (
              <GridActionsCellItem
                key={action.label}
                icon={<>{action.icon}</>}
                label={action.label}
                onClick={() => action.onClick(params.row as T)}
              />
            ))}
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
        {user?.role === "admin" && (
          <Stack
            direction={"row"}
            sx={{justifyContent: "flex-end", mb: 2, mx: 2, mt: 2}}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              aria-label="add"
              onClick={handleAddClick}>
              Nuovo
            </Button>
          </Stack>
        )}
        <DataGrid
          sx={{border: "none", height: "100%"}}
          loading={loading}
          disableColumnMenu={true}
          rows={items}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
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
