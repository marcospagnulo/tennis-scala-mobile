import {type SxProps} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Season} from "../../domain/types";
import type {Theme} from "@emotion/react";
import {collections} from "../../lib/firebase";
import {Crud} from "../../components/Crud";
import {columns} from "./columns";
import {Form} from "./form";
import dayjs from "dayjs";
import {useAppContext} from "../../app/context";

const now = new Date().getTime();

const initialFormData: Partial<Season> = {
  name: `Stagione ${dayjs().year()}/${dayjs().add(1, "year").year()}`,
  start: new Timestamp(now / 1000, 0),
  end: new Timestamp(dayjs(now).add(1, "year").unix(), 0),
  maxChallengesPerPeriod: 3,
  periods: [
    {
      start: new Timestamp(now / 1000, 0),
      matches: {},
    },
  ],
  ranking: [],
};

export function SeasonsPage({sx}: {sx?: SxProps<Theme>}) {
  const {mobile} = useAppContext();

  if (!collections) return null;

  return (
    <Crud<Season>
      sx={{...sx, ...(!mobile && {py: 2})}}
      collection={collections.seasons}
      columns={columns}
      title="Stagioni"
      form={Form}
      initialFormData={initialFormData}
    />
  );
}
