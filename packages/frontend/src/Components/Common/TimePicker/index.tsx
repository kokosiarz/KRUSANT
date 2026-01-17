import React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export interface TimePickerProps {
  hour?: number;
  minute?: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  hourLabel?: string;
  minuteLabel?: string;
  hourOptions?: number[];
  minuteOptions?: number[];
  compact?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  hour = 9,
  minute = 0,
  onHourChange,
  onMinuteChange,
  hourLabel = 'Godzina',
  minuteLabel = 'Minuty',
  hourOptions,
  minuteOptions,
  compact = false,
}) => {
  const hours = hourOptions ?? Array.from({ length: 24 }, (_, i) => i);
  const minutes = minuteOptions ?? [0, 15, 30, 45];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: compact ? 0.5 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        ...(compact && { mt: 0, mb: 0 }),
      }}
    >
      <FormControl sx={{ minWidth: compact ? 60 : 100 }} size="small">
        <InputLabel>{hourLabel}</InputLabel>
        <Select
          value={hour}
          onChange={(e) => onHourChange(e.target.value as number)}
          label={hourLabel}
        >
          {hours.map((h) => (
            <MenuItem key={h} value={h}>
              {String(h).padStart(2, '0')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ fontSize: compact ? '1.1rem' : '1.5rem', fontWeight: 'bold', mx: compact ? 0.5 : 1 }}>:</Box>
      <FormControl sx={{ minWidth: compact ? 60 : 100 }} size="small">
        <InputLabel>{minuteLabel}</InputLabel>
        <Select
          value={minute}
          onChange={(e) => onMinuteChange(e.target.value as number)}
          label={minuteLabel}
        >
          {minutes.map((m) => (
            <MenuItem key={m} value={m}>
              {String(m).padStart(2, '0')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TimePicker;
