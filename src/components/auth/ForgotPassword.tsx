import {useState} from "react";
import {sendPasswordResetEmail} from "firebase/auth";
import {Button, Stack, TextField, Typography} from "@mui/material";
import {auth} from "../../lib/firebase";

export function ForgotPassword({onLoginClick}: {onLoginClick: () => void}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setEmailTouched(true);

    if (!trimmedEmail) {
      setError("Inserisci il tuo indirizzo email.");
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
      await sendPasswordResetEmail(auth, trimmedEmail);
      setSuccess(
        "Ti abbiamo inviato un'email con le istruzioni per recuperare la password.",
      );
    } catch (err) {
      setError(
        "Non è stato possibile inviare l'email di recupero. Controlla l'indirizzo email e riprova.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h5" align="center">
        Recupera Password
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
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
      </Stack>
      <Button
        onClick={handleSubmit}
        disabled={loading || !isEmailValid}
        loading={loading}
        variant="contained"
        color="primary">
        {loading ? "Invio in corso..." : "Invia email di recupero"}
      </Button>
      <Button onClick={onLoginClick} disabled={loading} variant="text">
        Torna al Login
      </Button>
    </>
  );
}
