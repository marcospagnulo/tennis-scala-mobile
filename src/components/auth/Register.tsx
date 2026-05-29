import {useState} from "react";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {Button, Stack, TextField, Typography} from "@mui/material";
import {auth} from "../../lib/firebase";

export function Register({onLoginClick}: {onLoginClick: () => void}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword;
  const hasEmailError = trimmedEmail.length > 0 && !isEmailValid;
  const hasPasswordError = password.length > 0 && !isPasswordValid;
  const hasConfirmPasswordError = confirmPassword.length > 0 && !passwordsMatch;
  const hasValidationErrors =
    !trimmedEmail ||
    !password ||
    !confirmPassword ||
    hasEmailError ||
    hasPasswordError ||
    hasConfirmPasswordError;

  const handleSubmit = async () => {
    setError(null);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!trimmedEmail || !password) {
      setError("Inserisci email e password.");
      return;
    }

    if (!isEmailValid) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    if (!isPasswordValid) {
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
    <>
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
          onBlur={() => setPasswordTouched(true)}
          required
          label="Password"
          error={passwordTouched && hasPasswordError}
          helperText={
            passwordTouched && hasPasswordError
              ? "La password deve contenere almeno 6 caratteri."
              : " "
          }
        />
        <TextField
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmPasswordTouched(true)}
          required
          label="Conferma password"
          error={confirmPasswordTouched && hasConfirmPasswordError}
          helperText={
            confirmPasswordTouched && hasConfirmPasswordError
              ? "Le password non coincidono."
              : " "
          }
        />
      </Stack>
      <Button
        onClick={handleSubmit}
        disabled={loading || hasValidationErrors}
        loading={loading}
        variant="contained"
        color="primary">
        {loading ? "Registrazione in corso..." : "Registrati"}
      </Button>
      <Button onClick={onLoginClick} disabled={loading} variant="text">
        Hai gia un account? Accedi
      </Button>
    </>
  );
}
