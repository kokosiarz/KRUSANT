import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TimePicker from '../../../../Common/TimePicker';
import { StepStartHourProps } from './types';
import { startHourStyles } from './styles';
import { copy } from './copy';

const HourPicker: React.FC<StepStartHourProps> = ({ startHour, setStartHour }) => {
  const [hour, minute] = startHour.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const handleHourChange = (h: number) => setStartHour(`${pad(h)}:${pad(minute || 0)}`);
  const handleMinuteChange = (m: number) => setStartHour(`${pad(hour || 0)}:${pad(m)}`);

  const formatTime = (hours: number, minutes: number) => `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <Fade in={true} timeout={300}>
      <Box sx={startHourStyles.root}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {copy.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {copy.subtitle}
          </Typography>
        </Box>
        <Box sx={startHourStyles.pickerCard}>
          <TimePicker
            hour={hour}
            minute={minute}
            onHourChange={handleHourChange}
            onMinuteChange={handleMinuteChange}
          />
        </Box>
        <Box sx={startHourStyles.summaryCard}>
          <Typography variant="caption" color="text.secondary">
            {copy.startLabel}
          </Typography>
          <Typography variant="h6">{formatTime(hour, minute)}</Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default HourPicker;
