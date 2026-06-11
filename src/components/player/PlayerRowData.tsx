import {
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import {useEffect, useState} from "react";
import {EditableTypography} from "../EditableTypography";
import {CancelIcon, EditIcon} from "../../icons";
import dayjs from "dayjs";
import {MobileDatePicker} from "@mui/x-date-pickers";
import {genderMap} from "../../domain/types";
import {useAppContext} from "../../app/context";
import {Done} from "@mui/icons-material";

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
  const {mobile} = useAppContext();

  const [date, setDate] = useState<dayjs.Dayjs | null>();
  const [edit, setEdit] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);

  useEffect(() => {
    if (type === "date" && value) {
      setDate(dayjs((value as Timestamp).toDate()));
    }
  }, [type, value]);

  const handleConfirm = (value: string | number | Timestamp) => {
    setEdit(false);
    onEdit(value);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  const handleEditBirthDate = () => {
    if (!date) return;
    handleConfirm(new Timestamp(date.toDate().getTime() / 1000, 0));
  };

  return (
    <Stack
      direction={"row"}
      spacing={2}
      sx={{alignItems: "center", height: mobile ? 52 : 40}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      {!mobile && (
        <Typography color="textSecondary" variant="subtitle1">
          {label}
        </Typography>
      )}
      {(type === "string" || type === "tel") && (
        <EditableTypography
          variant="body1"
          label={mobile ? label : undefined}
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
            label={mobile ? label : undefined}
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
            <CancelIcon fontSize="inherit" color="error" />
          </IconButton>
        </Stack>
      )}
      {type === "gender" && !edit && (
        <Stack direction={mobile ? "column" : "row"} spacing={mobile ? 0 : 1}>
          {mobile && (
            <Typography
              color="textSecondary"
              variant="subtitle1"
              sx={{lineHeight: 1.2}}>
              {label}
            </Typography>
          )}
          <Typography color="textPrimary" variant="body1">
            {genderMap[value as string] ?? "Uomo"}
          </Typography>
        </Stack>
      )}
      {type === "date" && edit && (
        <Stack direction={"row"} spacing={1} sx={{alignItems: "center"}}>
          <MobileDatePicker
            sx={{"& .MuiPickersInputBase-sectionsContainer": {py: 0}}}
            format="DD/MM/YYYY"
            label={mobile ? label : undefined}
            slotProps={{textField: {variant: "standard", size: "small"}}}
            defaultValue={date}
            onAccept={setDate}
          />
          <IconButton size="small" onClick={handleEditBirthDate}>
            <Done fontSize="inherit" color="primary" />
          </IconButton>
          <IconButton size="small" onClick={() => setEdit(false)}>
            <CancelIcon fontSize="inherit" color="error" />
          </IconButton>
        </Stack>
      )}
      {type === "date" && !edit && (
        <Stack direction={mobile ? "column" : "row"} spacing={mobile ? 0 : 1}>
          <Typography
            color="textSecondary"
            variant="subtitle1"
            sx={{lineHeight: 1.2}}>
            {label}
          </Typography>
          <Typography color="textPrimary" variant="body1">
            {value
              ? dayjs((value as Timestamp).toDate()).format("DD/MM/YYYY")
              : ""}
          </Typography>
        </Stack>
      )}
      {!edit && editable && (hover || mobile) && (
        <IconButton size="small" onClick={() => setEdit(true)}>
          <EditIcon fontSize="inherit" color="secondary" />
        </IconButton>
      )}
    </Stack>
  );
};

export {PlayerRowData};
