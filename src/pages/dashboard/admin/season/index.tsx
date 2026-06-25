import {Dialog, DialogTitle, type SxProps} from "@mui/material";
import {Timestamp} from "firebase/firestore";
import type {Season} from "../../../../domain/types";
import type {Theme} from "@emotion/react";
import {collections} from "../../../../lib/firebase";
import {Crud} from "../../../../components/Crud";
import {columns} from "./columns";
import {Form} from "./form";
import dayjs from "dayjs";
import {useAuthorization} from "../../../../hooks/useAuthorization";
import {useAppContext} from "../../../../app/context";

const now = new Date().getTime();

const SeasonsDialog = ({
  open,
  onClose,
}: {
  sx?: SxProps<Theme>;
  open: boolean;
  onClose: () => void;
}) => {
  const {user} = useAppContext();
  const {isAdmin, isManager} = useAuthorization();

  const initialFormData: Partial<Season> = {
    name: `Stagione ${dayjs().year()}/${dayjs().add(1, "year").year()}`,
    start: new Timestamp(now / 1000, 0),
    end: new Timestamp(dayjs(now).add(1, "year").unix(), 0),
    maxMatchesPerPeriod: 3,
    ranking: [],
    createdBy: user?.id,
  };

  if (!collections) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Stagioni</DialogTitle>
      <Crud<Season>
        sx={{height: "80vh"}}
        collection={collections.seasons}
        columns={columns}
        title="Stagioni"
        form={Form}
        initialFormData={initialFormData}
        rules={{
          canAdd: isAdmin || isManager,
          canEdit: row => isAdmin || row.createdBy === user?.id,
          canDelete: row => isAdmin || row.createdBy === user?.id,
        }}
      />
    </Dialog>
  );
};

export {SeasonsDialog};
