import {type SxProps} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Player, querySort} from "../../domain/types";
import type {Theme} from "@emotion/react";
import {collections} from "../../lib/firebase";
import {Crud} from "../../components/Crud";
import {columns} from "./columns";
import {Form} from "./form";
import {useAppContext} from "../../app/context";
import {useAuthorization} from "../../hooks/useAuthorization";
import {useEffect} from "react";

const initialSort: querySort[] = [{field: "surname", sort: "asc"}];

export function PlayersPage({sx}: {sx?: SxProps<Theme>}) {
  const {user, mobile} = useAppContext();
  const {isAdmin, isManager} = useAuthorization();

  const initialFormData: Partial<Player> = {
    name: "",
    surname: "",
    birthDate: new Timestamp(new Date().getTime() / 1000, 0),
    phone: "",
    email: "",
    gender: "male",
    avatar: "",
    createdBy: user?.id,
  };

  useEffect(() => {
    //
  }, []);

  if (!collections) return null;

  return (
    <Crud<Player>
      sx={{...sx, ...(!mobile && {py: 2})}}
      collection={collections.players}
      columns={columns}
      title="Giocatore"
      form={Form}
      initialFormData={initialFormData}
      sort={initialSort}
      rules={{
        canAdd: isAdmin || isManager,
        canEdit: row =>
          isAdmin || (user?.id !== undefined && row.createdBy === user?.id),
        canDelete: row =>
          isAdmin || (user?.id !== undefined && row.createdBy === user?.id),
      }}
    />
  );
}
