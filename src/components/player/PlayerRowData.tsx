import {
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import {useState} from "react";
import {EditableTypography} from "../EditableTypography";
import {CancelIcon, EditIcon} from "../../icons";
import dayjs from "dayjs";
import {MobileDatePicker} from "@mui/x-date-pickers";
import {genderMap} from "../../domain/types";
import {useAppContext} from "../../app/context";

const PlayerRowData = ({
  label,
  value,
  editable = false,
  type,
  onEdit,
}: {
  label: string;
  value: string | Timestamp | undefined | null;
  editable?: boolean;
  type: "tel" | "string" | "date" | "gender";
  onEdit: (value: string | number | Timestamp) => void;
}) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const {mobile} = useAppContext();

  const handleConfirm = (value: string | number | Timestamp) => {
    setEdit(false);
    onEdit(value);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  const handleEditBirthDate = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    handleConfirm(new Timestamp(date.toDate().getTime() / 1000, 0));
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{alignItems: "center", height: 40}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <Typography color="textSecondary" variant="subtitle1">
        {label}
      </Typography>
      {(type === "string" || type === "tel") && (
        <EditableTypography
          variant="body1"
          edit={edit}
          value={(value as string) ?? ""}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          color="textPrimary"
          type={type}
          textFieldVariant="standard"
        />
      )}
      {type === "gender" && edit && (
        <Stack direction={"row"} spacing={1} sx={{alignItems: "center"}}>
          <TextField
            select
            name="gender"
            value={(value as string) ?? "male"}
            onChange={e => handleConfirm(e.target.value)}
            autoFocus
            variant="standard"
            size="small">
            <MenuItem value="male">Uomo</MenuItem>
            <MenuItem value="female">Donna</MenuItem>
          </TextField>
          <IconButton size="small" onClick={() => setEdit(false)}>
            <CancelIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      )}
      {type === "gender" && !edit && (
        <Stack direction={"row"} spacing={1} sx={{alignItems: "center"}}>
          <Typography color="textPrimary" variant="body1">
            {genderMap[value as string] ?? "Uomo"}
          </Typography>
        </Stack>
      )}
      {type === "date" && edit && (
        <Stack direction={"row"} spacing={1} sx={{alignItems: "center"}}>
          <MobileDatePicker
            sx={{"& .MuiPickersInputBase-sectionsContainer": {py: 1}}}
            format="DD/MM/YYYY"
            slotProps={{textField: {variant: "standard", size: "small"}}}
            value={value ? dayjs((value as Timestamp).toDate()) : null}
            onAccept={handleEditBirthDate}
          />
          <IconButton size="small" onClick={() => setEdit(false)}>
            <CancelIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      )}
      {!edit && type === "date" && (
        <Typography color="textPrimary" variant="body1">
          {value
            ? dayjs((value as Timestamp).toDate()).format("DD/MM/YYYY")
            : ""}
        </Typography>
      )}
      {!edit && editable && (hover || mobile) && (
        <IconButton size="small" onClick={() => setEdit(true)}>
          <EditIcon fontSize="inherit" />
        </IconButton>
      )}
    </Stack>
  );
};

export {PlayerRowData};
