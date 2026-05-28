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
import {DeleteIcon} from "../../icons";

const Form = (
  formData: Partial<Player>,
  handleChange: (key: keyof Partial<Player>, value: any) => void,
  handleFileLoad: (evt: React.ChangeEvent<HTMLInputElement>) => void,
) => {
  const handleBirthDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    handleChange("birthDate", new Timestamp(date.toDate().getTime() / 1000, 0));
  };

  return (
    <>
      <Stack direction="row" sx={{mb: 2, gap: 2, alignItems: "center"}}>
        <Box sx={{position: "relative"}}>
          <Avatar
            src={formData.avatar}
            alt="Avatar"
            sx={{width: 50, height: 50}}
          />
          {formData.avatar && formData.avatar !== "" && (
            <IconButton
              size="small"
              sx={{position: "absolute", zIndex: 1, top: -10, right: -10}}
              onClick={() => handleChange("avatar", "")}>
              <DeleteIcon color="error" fontSize="small" />
            </IconButton>
          )}
        </Box>
        <TextField
          type="file"
          onChange={handleFileLoad}
          slotProps={{
            input: {
              inputProps: {
                accept:
                  "image/png, image/jpeg, image/jpg, image/gif, image/webp",
              },
            },
          }}
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
          value={formData.gender}
          onChange={e => handleChange("gender", e.target.value)}>
          <MenuItem value="male">Uomo</MenuItem>
          <MenuItem value="female">Donna</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

export {Form};
