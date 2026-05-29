import {CardMedia, Stack} from "@mui/material";
import {useState} from "react";
import {Register} from "./Register";
import {Login} from "./Login";

const Auth = () => {
  const [view, setView] = useState<"login" | "register">("login");
  return (
    <Stack spacing={2} sx={{p: 4}}>
      <CardMedia
        component="img"
        image={`logo.png`}
        alt="Logo"
        sx={{height: 100, objectFit: "contain"}}
      />
      {view === "login" && (
        <Login onRegisterClick={() => setView("register")} />
      )}
      {view === "register" && (
        <Register onLoginClick={() => setView("login")} />
      )}
    </Stack>
  );
};

export {Auth};
