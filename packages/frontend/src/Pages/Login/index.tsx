import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../Components/Common/LoginForm';

/**
 * Centred single-column sign-in. The card is deliberately narrow (max 420px):
 * the old md-width container stretched a two-field form across half the screen,
 * which is what made it feel like an unstyled page rather than a product.
 */
const Login: React.FC = () => {
  const { isLoading } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        // A very faint bronze wash from the top so the sign-in screen carries
        // some brand without tinting the whole app.
        backgroundImage: (theme) =>
          `radial-gradient(120% 60% at 50% 0%, ${theme.palette.primary.main}14 0%, transparent 60%)`,
      }}
    >
      <Typography
        variant="h5"
        component="span"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: 'primary.main',
          mb: 3,
          userSelect: 'none',
        }}
      >
        KRUSANT
      </Typography>

      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          width: '100%',
          maxWidth: 420,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ładowanie…
            </Typography>
          </Box>
        ) : (
          <LoginForm />
        )}
      </Paper>

      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 3 }}>
        Szkoła Złotnictwa · panel administracyjny
      </Typography>
    </Box>
  );
};

export default Login;
