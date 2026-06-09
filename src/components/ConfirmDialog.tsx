import {Info} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
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
      <DialogTitle align="center">{title}</DialogTitle>
      <DialogContent>
        <Stack direction="row" sx={{alignItems: "center"}} spacing={1}>
          <Info color="primary" sx={{fontSize: 60}} />
          <DialogContentText>{content}</DialogContentText>
        </Stack>
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
