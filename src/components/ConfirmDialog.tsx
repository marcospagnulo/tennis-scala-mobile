import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const ConfirmDialog = ({
  open,
  title,
  content,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onClose: (confirmed: boolean) => void;
}) => {
  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} variant="outlined" color="error">
          Annulla
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Conferma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export {ConfirmDialog};
