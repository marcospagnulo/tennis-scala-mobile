import {useState} from "react";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {
  Button,
  CardMedia,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {auth} from "../../lib/firebase";

type RegisterProps = {
  onBackToLogin: () => void;
};

export function Register({onBackToLogin}: RegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async () => {
    setError(null);
    setEmailTouched(true);
    setConfirmPasswordTouched(true);

    if (!trimmedEmail || !password) {
      setError("Inserisci email e password.");
      return;
    }

    if (!isEmailValid) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    if (password.length < 6) {
      setError("La password deve contenere almeno 6 caratteri.");
      return;
    }

    if (!passwordsMatch) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);

    if (!auth) {
      setError("Firebase non e configurato correttamente.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      // Il cambio di stato verra gestito da onAuthStateChanged in App.tsx
    } catch (err) {
      setError("Registrazione non riuscita. Verifica i dati e riprova.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      spacing={2}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}>
      <Paper
        sx={{display: "flex", flexDirection: "column", gap: 2, padding: 2}}>
        <CardMedia
          component="img"
          image={`logo.png`}
          alt="Logo"
          sx={{height: 100, objectFit: "contain"}}
        />
        <Typography variant="h5" align="center">
          Registrazione
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
            sx={{mb: 2}}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            label="Password"
          />
          <TextField
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onBlur={() => setConfirmPasswordTouched(true)}
            required
            label="Conferma password"
            error={
              confirmPasswordTouched &&
              confirmPassword.length > 0 &&
              !passwordsMatch
            }
            helperText={
              confirmPasswordTouched &&
              confirmPassword.length > 0 &&
              !passwordsMatch
                ? "Le password non coincidono."
                : " "
            }
          />
        </Stack>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          loading={loading}
          variant="contained"
          color="primary">
          {loading ? "Registrazione in corso..." : "Registrati"}
        </Button>
        <Button onClick={onBackToLogin} disabled={loading} variant="text">
          Hai gia un account? Accedi
        </Button>
      </Paper>
    </Stack>
  );
}
