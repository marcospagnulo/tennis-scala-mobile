import {type SxProps} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Season} from "../../domain/types";
import type {Theme} from "@emotion/react";
import {collections} from "../../lib/firebase";
import {Crud} from "../../components/Crud";
import {columns} from "./columns";
import {Form} from "./form";
import dayjs from "dayjs";

const initialFormData: Partial<Season> = {
  name: `Stagione ${dayjs().year()}/${dayjs().add(1, "year").year()}`,
  startDate: new Timestamp(new Date().getTime() / 1000, 0),
  weeks: 28,
};

export function SeasonsPage({sx}: {sx?: SxProps<Theme>}) {
  if (!collections) return null;

  return (
    <Crud<Season>
      sx={sx}
      collection={collections.seasons}
      columns={columns}
      title="Stagioni"
      form={Form}
      initialFormData={initialFormData}
    />
  );
}
