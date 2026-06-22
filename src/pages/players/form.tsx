import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Player} from "../../domain/types";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {DeleteIcon, EditIcon} from "../../icons";
import {CropDialog} from "../../components/upload/CropDialog";
import {useRef, useState} from "react";

const Form = (
  formData: Partial<Player>,
  handleChange: (key: keyof Partial<Player>, value: any) => void,
) => {
  const [cropDialogFile, setCropDialogFile] = useState<string>();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const hanldeUpload = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileUpload = evt.target.files?.item(0);
    if (fileUpload) {
      const reader = new FileReader();
      reader.readAsDataURL(fileUpload);
      reader.onload = () => {
        const base64 = reader.result;
        setCropDialogFile(base64 as string);
      };
    }
  };

  const handleBirthDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    handleChange("birthDate", new Timestamp(date.toDate().getTime() / 1000, 0));
  };

  return (
    <>
      <Stack direction="row" sx={{mb: 2, gap: 2, alignItems: "center"}}>
        <Avatar
          src={formData.avatar}
          alt="Avatar"
          sx={{width: 50, height: 50}}
        />
        <IconButton size="small" onClick={() => inputFileRef.current?.click()}>
          <EditIcon color="primary" fontSize="small" />
        </IconButton>
        {formData.avatar && formData.avatar !== "" && (
          <IconButton size="small" onClick={() => handleChange("avatar", "")}>
            <DeleteIcon color="error" fontSize="small" />
          </IconButton>
        )}
        <input
          ref={inputFileRef}
          type="file"
          onChange={hanldeUpload}
          style={{display: "none"}}
          accept="image/*"
        />

        <CropDialog
          open={cropDialogFile !== undefined}
          onClose={() => setCropDialogFile(undefined)}
          onConfirm={file => {
            handleChange("avatar", file);
            setCropDialogFile(undefined);
          }}
          file={cropDialogFile}
        />
      </Stack>
      <TextField
        fullWidth
        label="Nome"
        name="name"
        value={formData.name}
        onChange={e => handleChange("name", e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Cognome"
        name="surname"
        value={formData.surname}
        onChange={e => handleChange("surname", e.target.value)}
        margin="normal"
      />
      <Box sx={{mt: 2, mb: 1}}>
        <DatePicker
          format="DD/MM/YYYY"
          label="Data di Nascita"
          value={formData.birthDate ? dayjs(formData.birthDate.toDate()) : null}
          onChange={handleBirthDateChange}
        />
      </Box>
      <TextField
        fullWidth
        label="Telefono"
        name="phone"
        value={formData.phone}
        onChange={e => handleChange("phone", e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        value={formData.email}
        onChange={e => handleChange("email", e.target.value)}
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="gender-label">Genere</InputLabel>
        <Select<string>
          labelId="gender-label"
          label="Genere"
          name="gender"
          value={formData.gender ?? "male"}
          onChange={e => handleChange("gender", e.target.value)}>
          <MenuItem value="male">Uomo</MenuItem>
          <MenuItem value="female">Donna</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

export {Form};
