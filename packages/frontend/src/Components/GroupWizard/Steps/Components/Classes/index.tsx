import React from 'react';
import { Fade, Box, Typography } from '@mui/material';
import ProposedClasses from './ProposedClasses';
import { Dayjs } from 'dayjs';
import { StepClassesProps } from './types';

const Classes: React.FC<StepClassesProps> = ({ proposedDates, proposedDateObjects, onDateChange, onDateRemove, mode = 'template' }) => {
  const handleDateChange = (index: number, newDate: Date) => {
    const dayjs = require('dayjs').default;
    onDateChange(index, dayjs(newDate));
  };

  const dateObjectsAsDate = proposedDateObjects.map((d: Dayjs) => d.toDate());

  return (
    <Fade in timeout={300}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {mode === 'group' ? 'Zajęcia' : 'Proponowane zajęcia'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {mode === 'group' ? 'Zarządzaj terminami zajęć: dodaj, zmień lub usuń.' : 'Zweryfikuj lub usuń zaproponowane terminy zajęć.'}
        </Typography>
        <ProposedClasses
          proposedDates={proposedDates}
          proposedDateObjects={dateObjectsAsDate}
          onDateChange={handleDateChange}
          onDateRemove={onDateRemove}
        />
      </Box>
    </Fade>
  );
};

export default Classes;
