import { useAppContext } from "../app/context";

const Admin = ({children}: {children: React.ReactNode}) => {
  const {user} = useAppContext();

  if (user?.role === "admin") {
    return <>{children}</>;
  }
  return null;
};

export {Admin};
