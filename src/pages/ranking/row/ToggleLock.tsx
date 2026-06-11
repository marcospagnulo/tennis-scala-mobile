import {IconButton} from "@mui/material";
import {Lock, LockOpen} from "@mui/icons-material";
import {useAppContext} from "../../../app/context";

const ToggleLock = ({
  lock,
  onToggleLock,
}: {
  lock: boolean;
  onToggleLock: (lock: boolean) => void;
}) => {
  const {user, mobile} = useAppContext();
  const isAdmin = user?.role === "admin";

  if (!isAdmin || mobile) return null;

  return (
    <>
      <IconButton size="small" onClick={() => onToggleLock(!lock)}>
        {!lock ? (
          <Lock color="primary" fontSize="inherit" />
        ) : (
          <LockOpen color="primary" fontSize="inherit" />
        )}
      </IconButton>
    </>
  );
};

export {ToggleLock};
