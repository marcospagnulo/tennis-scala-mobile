import {useState} from "react";
import {EditableTypography} from "../../../components/EditableTypography";
import {IconButton, Stack} from "@mui/material";
import {EditIcon} from "../../../icons";

const EditableField = ({
  field,
  value,
  isAdmin,
  hover,
  width,
  onEdit,
}: {
  field: string;
  value: string | number;
  isAdmin: boolean;
  hover: boolean;
  width: number;
  onEdit: (field: string, value: string | number) => void;
}) => {
  const [edit, setEdit] = useState(false);

  const handleEdit = (value: string | number) => {
    onEdit(field, value);
    setEdit(false);
  };

  return (
    <Stack
      direction={"row"}
      sx={{
        minWidth: width,
        gap: 1,
        alignItems: "center",
        justifyContent: "center",
      }}>
      <EditableTypography
        variant="body2"
        value={value + ""}
        edit={edit}
        onConfirm={handleEdit}
        onCancel={() => setEdit(false)}
        type="number"
      />
      {isAdmin && (
        <IconButton
          sx={{visibility: hover ? "visible" : "hidden", mr: -4}}
          size="small"
          onClick={() => setEdit(true)}>
          {!edit && <EditIcon fontSize="inherit" />}
        </IconButton>
      )}
    </Stack>
  );
};

export {EditableField};
