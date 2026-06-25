import {useAuthorization} from "../hooks/useAuthorization";

const CanManageSeason = ({children}: {children: React.ReactNode}) => {
  const {canManageSeason} = useAuthorization();

  if (canManageSeason) {
    return <>{children}</>;
  }
  return null;
};

export {CanManageSeason};
