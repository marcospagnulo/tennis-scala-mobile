import {useAppContext} from "../app/context";

const useAuthorization = () => {
  const {user, currentSeason} = useAppContext();

  return {
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    canManageSeason:
      user?.role === "admin" ||
      (currentSeason?.createdBy &&
        user &&
        user.role === "manager" &&
        currentSeason.createdBy === user.id),
  };
};

export {useAuthorization};
