import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import GoogleIcon from '@mui/icons-material/Google';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { passkeysApi, passkeysSupported } from '../../../api/endpoints/passkeys';
import { useQueryClient } from '@tanstack/react-query';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../../hooks/useAuth';
import { API_BASE_URL } from '../../../api/client';
import { LoginFormProps } from './types';

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();

  // The Google callback can't render an error itself — it's a server-side
  // redirect — so it hands the reason back on the query string. Read it once;
  // a failed password login afterwards should replace it, not stack with it.
  const [googleError, setGoogleError] = useState(() =>
    new URLSearchParams(window.location.search).get('authError'),
  );
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const queryClient = useQueryClient();
  const shownError = error ?? passkeyError ?? googleError;

  const handlePasskeyLogin = async () => {
    setPasskeyBusy(true);
    setPasskeyError(null);
    setGoogleError(null);
    try {
      const { user } = await passkeysApi.login();
      // Seed the same cache key AuthContext reads, so the app switches to the
      // signed-in state without a round trip.
      queryClient.setQueryData(['currentUser'], user);
      onLoginSuccess?.();
    } catch (err) {
      // Cancelling the OS sheet throws NotAllowedError/AbortError — that's the
      // user changing their mind, not a failure worth shouting about.
      const name = (err as { name?: string })?.name;
      if (name !== 'NotAllowedError' && name !== 'AbortError') {
        setPasskeyError(
          err instanceof Error ? err.message : 'Logowanie kluczem nie powiodło się',
        );
      }
    } finally {
      setPasskeyBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGoogleError(null);
    try {
      await login({ email, password });
      setPassword('');
      onLoginSuccess?.();
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Must be absolute: in production the SPA and API share an origin (nginx
    // proxies /api), but in local dev the SPA is on :3001 and the API on
    // :3002, so a relative '/api/...' would hit the Vite dev server and 404.
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <>
      {/* Just "Zaloguj się" — the KRUSANT wordmark now sits above the card, so
          repeating it here read as stuttering. */}
      <Typography variant="h5" component="h1" sx={{ fontWeight: 650 }}>
        Zaloguj się
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
        Użyj konta otrzymanego od administratora
      </Typography>
      {shownError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {shownError}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Hasło"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Zaloguj'}
          </Button>
          
          <Divider sx={{ my: 1, color: 'text.secondary', fontSize: '0.8125rem' }}>
            lub
          </Divider>

          {/* Neutral rather than Google-blue: one saturated brand blue in the
              middle of a bronze/neutral palette was the loudest thing on the
              screen. The icon still identifies it. */}
          <Button
            variant="outlined"
            size="large"
            fullWidth
            color="inherit"
            startIcon={<GoogleIcon sx={{ color: '#4285f4' }} />}
            onClick={handleGoogleLogin}
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'text.secondary',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Zaloguj przez Google
          </Button>

          {/* Only offered where WebAuthn exists — on an unsupported browser or
              a plain-http origin the button could never work. */}
          {passkeysSupported() && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              color="inherit"
              startIcon={<FingerprintIcon color="primary" />}
              disabled={passkeyBusy}
              onClick={handlePasskeyLogin}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'text.secondary',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {passkeyBusy ? 'Czekam na potwierdzenie…' : 'Zaloguj kluczem (Face ID / Touch ID)'}
            </Button>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default LoginForm;
