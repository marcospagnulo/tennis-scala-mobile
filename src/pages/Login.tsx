import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError(null);
    setLoading(true);

    if (!auth) {
      setError('Firebase non è configurato correttamente.');
      setLoading(false);
      return;
    }

    try {
      signInWithEmailAndPassword(auth, email, password);
      // Il cambio di stato verrà gestito da onAuthStateChanged in App.tsx
    } catch (err) {
      setError('Credenziali non valide. Riprova.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>      
      <Paper sx={{display: "flex", flexDirection: "column", gap: 2, padding: 2}}>
        <Typography variant="h5" align="center">Login</Typography>
        <TextField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          label="Email"
        />
        <TextField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          label="Password"
        />
        <Button onClick={handleLogin} disabled={loading} variant="contained" color="primary" sx={{ padding: '0.5rem' }}>
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>
        {error && <Typography color="error">{error}</Typography>}
      </Paper>
    </Stack>
  );
}
