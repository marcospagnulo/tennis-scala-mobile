import {IconButton} from "@mui/material";
import {Lock, LockOpen} from "@mui/icons-material";
import {useAppContext} from "../../../app/context";
import {useAuthorization} from "../../../hooks/useAuthorization";

const ToggleLock = ({
  lock,
  onToggleLock,
}: {
  lock: boolean;
  onToggleLock: (lock: boolean) => void;
}) => {
  const {mobile} = useAppContext();
  const {canManageSeason} = useAuthorization();

  if (!canManageSeason || mobile) return null;

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
