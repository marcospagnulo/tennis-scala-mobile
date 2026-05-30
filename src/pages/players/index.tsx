import {type SxProps} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Player} from "../../domain/types";
import type {Theme} from "@emotion/react";
import {collections} from "../../lib/firebase";
import {Crud} from "../../components/Crud";
import {columns} from "./columns";
import {Form} from "./form";

const initialFormData: Partial<Player> = {
  name: "",
  surname: "",
  birthDate: new Timestamp(new Date().getTime() / 1000, 0),
  phone: "",
  email: "",
  gender: "male",
  avatar: "",
};

export function PlayersPage({sx}: {sx?: SxProps<Theme>}) {
  if (!collections) return null;
  return (
    <Crud<Player>
      sx={sx}
      collection={collections.players}
      columns={columns}
      title="Giocatore"
      form={Form}
      initialFormData={initialFormData}
    />
  );
}
