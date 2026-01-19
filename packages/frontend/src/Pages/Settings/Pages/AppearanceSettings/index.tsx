import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AppearanceSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ustawienia wyglądu
      </Typography>
      <Typography color="textSecondary">
        Tutaj będą dostępne opcje dostosowania wyglądu aplikacji.
      </Typography>
    </Box>
  );
};

export default AppearanceSettings;
