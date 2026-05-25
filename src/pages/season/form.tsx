import {Box, TextField} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Season} from "../../domain/types";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";

const Form = (
  formData: Partial<Season>,
  handleChange: (key: keyof Partial<Season>, value: any) => void,
) => {
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    handleChange("startDate", new Timestamp(date.toDate().getTime() / 1000, 0));
  };

  return (
    <>
      <TextField
        fullWidth
        label="Nome"
        name="name"
        value={formData.name}
        onChange={e => handleChange("name", e.target.value)}
        margin="normal"
      />
      <Box sx={{mt: 2, mb: 1}}>
        <DatePicker
          format="DD/MM/YYYY"
          label="Data di Inizio"
          value={formData.startDate ? dayjs(formData.startDate.toDate()) : null}
          onChange={handleStartDateChange}
        />
      </Box>
      <TextField
        fullWidth
        label="Settimane"
        name="weeks"
        type="number"
        value={formData.weeks}
        onChange={e => handleChange("weeks", parseInt(e.target.value, 10))}
        margin="normal"
      />
    </>
  );
};

export {Form};
