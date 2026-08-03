import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { authApi } from '@api/endpoints/auth';
import { useAuth } from '@/hooks/useAuth';

/** Must match MIN_PASSWORD_LENGTH in the backend's users.constants.ts. */
const MIN_PASSWORD_LENGTH = 10;

interface ChangePasswordProps {
  /**
   * True when the user is here because of an admin-issued temporary password
   * rather than by choice — the copy explains why, and there's no way out
   * except changing it or logging out.
   */
  forced?: boolean;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ forced = false }) => {
  const { refetchUser, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      setDone(true);
      // Re-reads the profile, which clears mustChangePassword and unlocks the
      // rest of the app.
      await refetchUser();
    },
  });

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    newPassword === confirmPassword &&
    !mutation.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate({ currentPassword, newPassword });
  };

  const errorText =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.isError
        ? 'Nie udało się zmienić hasła.'
        : null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: forced ? '100vh' : '60vh',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 460 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Zmiana hasła
        </Typography>

        {forced && !done && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Twoje konto korzysta z hasła tymczasowego. Ustaw własne hasło, aby
            przejść dalej.
          </Alert>
        )}

        {done ? (
          <Alert severity="success">Hasło zostało zmienione.</Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {errorText && <Alert severity="error">{errorText}</Alert>}

              <TextField
                label="Obecne hasło"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                fullWidth
                required
              />
              <TextField
                label="Nowe hasło"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                fullWidth
                required
                error={tooShort}
                helperText={`Co najmniej ${MIN_PASSWORD_LENGTH} znaków`}
              />
              <TextField
                label="Powtórz nowe hasło"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                fullWidth
                required
                error={mismatch}
                helperText={mismatch ? 'Hasła nie są takie same' : ' '}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                fullWidth
              >
                {mutation.isPending ? 'Zapisywanie…' : 'Zmień hasło'}
              </Button>

              {forced && (
                <Button onClick={() => void logout()} size="small">
                  Wyloguj się
                </Button>
              )}
            </Stack>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ChangePassword;
