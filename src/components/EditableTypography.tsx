import React, {useState} from "react";
import {
  Typography,
  TextField,
  Stack,
  IconButton,
  type SxProps,
  type TypographyProps,
} from "@mui/material";
import {CancelIcon, ConfirmIcon} from "../icons";

type EditableTypographyProps = {
  value: string;
  edit: boolean;
  sx?: SxProps;
  label?: string;
  type?: React.InputHTMLAttributes<unknown>["type"] | undefined;
  color?: TypographyProps["color"];
  textFieldVariant?: "standard" | "outlined" | "filled";
  textFieldWidth?: number;
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
  onConfirm: (t: string) => void;
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
  color = "textPrimary",
  textFieldVariant = "standard",
  textFieldWidth = 50,
}) => {
  const [currentText, setCurrentText] = useState<string>(value);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentText(event.target.value);
  };

  return (
    <>
      {edit && (
        <Stack direction="row" sx={{...sx, gap: 1, alignItems: "center"}}>
          <TextField
            sx={{minWidth: textFieldWidth}}
            type={type}
            label={label}
            value={currentText}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            onKeyUp={e => e.stopPropagation()}
            onChange={handleTextChange}
            autoFocus
            variant={textFieldVariant}
            size="small"
          />
          <IconButton size="small" onClick={() => onConfirm(currentText)}>
            <ConfirmIcon fontSize="inherit" color="primary" />
          </IconButton>
          <IconButton size="small" onClick={onCancel}>
            <CancelIcon fontSize="inherit" color="error" />
          </IconButton>
        </Stack>
      )}
      {!edit && !label && (
        <Typography color={color} variant={variant} sx={{...sx}}>
          {value}
        </Typography>
      )}
      {!edit && label && (
        <Stack sx={{...sx}}>
          <Typography
            color="textSecondary"
            variant="subtitle1"
            sx={{lineHeight: 1.2}}>
            {label}
          </Typography>
          <Typography color={color} variant={variant}>
            {value}
          </Typography>
        </Stack>
      )}
    </>
  );
};

export {EditableTypography};
