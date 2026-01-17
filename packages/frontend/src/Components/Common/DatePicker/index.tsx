import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { StepDateProps, EDateMode } from './types';
import { copy } from './copy';

const DatePicker: React.FC<StepDateProps> = ({
  selectedDate,
  minDate,
  maxDate,
  mode,
  setDate,
}) => {
  return (
    <Fade in={true} timeout={300}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {mode === EDateMode.startDate && copy.start.title}{mode === EDateMode.endDate && copy.end.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {mode === EDateMode.startDate && copy.start.subtitle}{mode === EDateMode.endDate && copy.end.subtitle}
          </Typography>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            views={['day']}
            value={selectedDate ? dayjs(selectedDate) : null}
            minDate={minDate ? dayjs(minDate) : undefined}
            maxDate={maxDate ? dayjs(maxDate) : undefined}
            onChange={date => date && setDate(date.toDate())}
          />
        </LocalizationProvider>
      </Box>
    </Fade>
  );
};

export default DatePicker;
