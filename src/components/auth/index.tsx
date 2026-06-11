import {CardMedia, Stack} from "@mui/material";
import {useState} from "react";
import {Login} from "./Login";
import {Register} from "./Register";
import {ForgotPassword} from "./ForgotPassword";

type View = "login" | "register" | "forgotPassword";

export function Auth() {
  const [view, setView] = useState<View>("login");

  return (
    <Stack
      sx={{
        p: 4,
        gap: 2,
      }}>
      <CardMedia
        component="img"
        image={`logo.png`}
        alt="Logo"
        sx={{height: 100, objectFit: "contain"}}
      />
      {view === "login" && (
        <Login
          onRegisterClick={() => setView("register")}
          onForgotPasswordClick={() => setView("forgotPassword")}
        />
      )}
      {view === "register" && (
        <Register onLoginClick={() => setView("login")} />
      )}
      {view === "forgotPassword" && (
        <ForgotPassword onLoginClick={() => setView("login")} />
      )}
    </Stack>
  );
}
