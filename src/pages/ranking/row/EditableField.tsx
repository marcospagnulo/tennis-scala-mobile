import {useState} from "react";
import {EditableTypography} from "../../../components/EditableTypography";
import {IconButton, Stack, Typography} from "@mui/material";
import {EditIcon} from "../../../icons";

const EditableField = ({
  field,
  value,
  liveValue,
  liveColor,
  isAdmin,
  hover,
  width,
  onEdit,
}: {
  field: string;
  value: number;
  liveValue?: number;
  liveColor?: string;
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
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <EditableTypography
        sx={{
          ...(edit && {
            position: "absolute",
            zIndex: 1,
            left: 0,
            p: 0.5,
            bgcolor: "background.paper",
          }),
        }}
        variant="body2"
        value={value + ""}
        edit={edit}
        onConfirm={newValue => handleEdit(parseInt(newValue))}
        onCancel={() => setEdit(false)}
        type="number"
        textFieldWidth={30}
      />
      {liveValue !== undefined && liveValue !== 0 && (
        <Typography
          variant="body2"
          sx={{
            color: liveColor,
            position: "absolute",
            right: 0,
          }}>{`+${liveValue}`}</Typography>
      )}
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
