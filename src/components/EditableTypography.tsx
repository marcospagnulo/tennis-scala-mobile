import React, {useState} from "react";
import {
  Typography,
  TextField,
  Stack,
  IconButton,
  type SxProps,
} from "@mui/material";
import {CancelIcon, ConfirmIcon} from "../icons";

type EditableTypographyProps = {
  value: string | number;
  edit: boolean;
  sx?: SxProps;
  label?: string;
  type?: "string" | "number";
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2";
  onConfirm: (t: string | number) => void;
  onCancel: () => void;
};

const EditableTypography: React.FC<EditableTypographyProps> = ({
  value,
  edit,
  sx,
  label,
  onConfirm,
  onCancel,
  variant = "body1",
  type = "string",
}) => {
  const [currentText, setCurrentText] = useState<string | number>(value);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentText(event.target.value);
  };

  return (
    <>
      {edit ? (
        <Stack direction="row" sx={{gap: 1, alignItems: "center"}}>
          <TextField
            sx={{minWidth: 50}}
            type={type}
            label={label}
            value={currentText}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            onKeyUp={e => e.stopPropagation()}
            onChange={handleTextChange}
            autoFocus
            variant="standard"
            size="small"
          />
          <IconButton size="small" onClick={() => onConfirm(currentText)}>
            <ConfirmIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={onCancel}>
            <CancelIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      ) : (
        <Typography variant={variant} style={{cursor: "pointer"}} sx={sx}>
          {value}
        </Typography>
      )}
    </>
  );
};

export {EditableTypography};
