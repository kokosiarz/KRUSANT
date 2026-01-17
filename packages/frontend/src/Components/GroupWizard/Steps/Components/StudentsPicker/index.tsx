import React from 'react';
import { Fade, Box, Typography } from '@mui/material';
import StudentsSelector from '@components/Common/StudentsSelector';
import { StepStudentsProps } from './types';

const StudentsPicker: React.FC<StepStudentsProps> = ({ studentIds, setStudentIds}) => {
  return (
    <Fade in timeout={300}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Kursanci
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Wybierz kursantów.
        </Typography>
        <StudentsSelector
          studentIds={studentIds}
          setStudentIds={setStudentIds}
        />
      </Box>
    </Fade>
  );
};

export default StudentsPicker;
