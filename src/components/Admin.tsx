import {useAuth} from "../hooks/useAuth";

const Admin = ({children}: {children: React.ReactNode}) => {
  const {user} = useAuth();

  if (user?.role === "admin") {
    return <>{children}</>;
  }
  return null;
};

export {Admin};
