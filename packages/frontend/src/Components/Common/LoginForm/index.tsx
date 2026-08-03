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
  const shownError = error ?? googleError;

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
      <Typography variant="h4" component="h1" gutterBottom>
        Zaloguj się do KRUSANTA
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
          
          <Divider sx={{ my: 2 }}>lub</Divider>
          
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              textTransform: 'none',
              borderColor: '#4285f4',
              color: '#4285f4',
              '&:hover': {
                borderColor: '#357ae8',
                backgroundColor: 'rgba(66, 133, 244, 0.04)',
              },
            }}
          >
            Zaloguj przez Google
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default LoginForm;
