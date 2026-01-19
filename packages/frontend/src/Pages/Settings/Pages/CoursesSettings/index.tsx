import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const CoursesSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ustawienia kursów
      </Typography>
      <Typography color="textSecondary">
        Tutaj będą dostępne opcje zarządzania ustawieniami kursów.
      </Typography>
    </Box>
  );
};

export default CoursesSettings;
