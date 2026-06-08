import {Box, TextField} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Season} from "../../../../domain/types";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";

const Form = (
  formData: Partial<Season>,
  handleChange: (key: keyof Partial<Season>, value: any) => void,
) => {
  const handleStartChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    handleChange("start", new Timestamp(date.toDate().getTime() / 1000, 0));
  };

  const handleEndChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    handleChange("end", new Timestamp(date.toDate().getTime() / 1000, 0));
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
          label="Inizio"
          value={formData.start ? dayjs(formData.start.toDate()) : null}
          onChange={handleStartChange}
        />
      </Box>
      <Box sx={{mt: 2, mb: 1}}>
        <DatePicker
          format="DD/MM/YYYY"
          label="Fine"
          value={formData.end ? dayjs(formData.end.toDate()) : null}
          onChange={handleEndChange}
        />
      </Box>
      <TextField
        fullWidth
        label="Sfide per periodo"
        name="maxMatchesPerPeriod"
        type="number"
        value={formData.maxMatchesPerPeriod ?? 3}
        onChange={e =>
          handleChange("maxMatchesPerPeriod", parseInt(e.target.value, 10))
        }
        margin="normal"
      />
    </>
  );
};

export {Form};
