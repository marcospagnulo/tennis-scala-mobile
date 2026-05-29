import {useState} from "react";
import {signInWithEmailAndPassword} from "firebase/auth";
import {Button, Stack, TextField, Typography} from "@mui/material";
import {auth} from "../../lib/firebase";

const Login = ({onRegisterClick}: {onRegisterClick: () => void}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  const handleSubmit = async () => {
    setError(null);

    if (!trimmedEmail || !password) {
      setError("Inserisci email e password.");
      return;
    }

    if (!isEmailValid) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    setLoading(true);

    if (!auth) {
      setError("Firebase non e configurato correttamente.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      // Il cambio di stato verra gestito da onAuthStateChanged in App.tsx
    } catch (err) {
      setError("Credenziali non valide. Riprova.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOpen = () => {
    setError(null);
    setPassword("");
    onRegisterClick();
  };

  return (
    <>
      <Typography variant="h5" align="center">
        Login
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Stack>
        <TextField
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          required
          label="Email"
          error={emailTouched && trimmedEmail.length > 0 && !isEmailValid}
          helperText={
            emailTouched && trimmedEmail.length > 0 && !isEmailValid
              ? "Inserisci un indirizzo email valido."
              : " "
          }
        />
        <TextField
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          label="Password"
        />
      </Stack>
      <Button
        onClick={handleSubmit}
        disabled={loading}
        loading={loading}
        variant="contained"
        color="primary">
        {loading ? "Accesso in corso..." : "Accedi"}
      </Button>
      <Button onClick={handleRegisterOpen} disabled={loading} variant="text">
        Non hai un account? Registrati
      </Button>
    </>
  );
};

export {Login};
