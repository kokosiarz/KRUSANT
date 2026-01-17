import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';

interface Props {
  loading: boolean;
  error: string | undefined | null;
  children: React.ReactNode;
}

const LoadingErrorHandler: React.FC<Props> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default LoadingErrorHandler;
