import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import {ErrorIcon} from "../icons";

const ErrorDialog = ({
  open,
  title,
  content,
  onClose,
}: {
  open: boolean;
  title: string;
  content: string;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle align="center">{title}</DialogTitle>
      <DialogContent>
        <Stack direction="row" sx={{alignItems: "center"}} spacing={2}>
          <ErrorIcon color="error" sx={{fontSize: 60}} />
          <DialogContentText>{content}</DialogContentText>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="text">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export {ErrorDialog};
