import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import LoginForm from '../../Common/LoginForm';


const Login: React.FC = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
          <Typography>Ładowanie...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
        <LoginForm />
      </Paper>
    </Container>
  );
};
        
export default Login;