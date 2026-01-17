import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import TimePicker from '../TimePicker';
import { StepLessonLengthProps } from './types';
import { copy } from './copy';


const DurationSlider: React.FC<StepLessonLengthProps> = ({ lessonLength, setLessonLength, compact = false }) => {
  // lessonLength is a string in 'HH:mm' format
  const MIN = 45;
  const MAX = 300; // 5 hours
  const STEP = 15;
  const marks = copy.marks;
  const parseTime = (time: string | number) => {
    if (typeof time === 'string' && time.includes(':')) {
      const [h, m] = time.split(':').map(Number);
      return { hours: h || 0, minutes: m || 0 };
    }
    // If time is a number or invalid string, fallback to default 1 hour
    const total = typeof time === 'number' ? time : 60;
    const h = Math.floor(total / 60);
    const m = total % 60;
    return { hours: h, minutes: m };
  };
  const formatTime = (hours: number, minutes: number) => `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const { hours, minutes } = parseTime(lessonLength);
  const totalMinutes = hours * 60 + minutes;
  const clampDuration = (value: number) => Math.min(MAX, Math.max(MIN, value));
  const handleSliderChange = (_event: Event, value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    const clamped = clampDuration(val);
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    setLessonLength(formatTime(h, m));
  };
  const handleHourChange = (hour: number) => {
    const clamped = clampDuration(hour * 60 + minutes);
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    setLessonLength(formatTime(h, m));
  };
  const handleMinuteChange = (minute: number) => {
    const clamped = clampDuration(hours * 60 + minute);
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    setLessonLength(formatTime(h, m));
  };
  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          display: compact ? 'block' : 'flex',
          flexDirection: compact ? undefined : 'column',
          gap: compact ? 1 : 3,
          width: '100%',
          alignItems: compact ? 'center' : undefined,
        }}
      >
        {!compact && (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {copy.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {copy.subtitle}
            </Typography>
          </Box>
        )}
        {!compact && <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: compact ? 0 : 260,
              height: compact ? 40 : undefined,
            }}
          >
            <Slider
              value={totalMinutes}
              onChange={handleSliderChange}
              max={MAX}
              step={STEP}
              marks={marks}
              valueLabelDisplay="auto"
              valueLabelFormat={(value: number) => {
                const h = Math.floor(value / 60);
                const m = value % 60;
                return formatTime(h, m);
              }}
              sx={{ width: 350, maxWidth: '100%', height: compact ? 4 : undefined }}
            />
          </Box>
        </Box>}
        {compact && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500, letterSpacing: 0.5 }}>
            czas trwania:
          </Typography>
        )}
        <TimePicker
          hour={hours}
          minute={minutes}
          hourLabel={copy.hourLabel}
          minuteLabel={copy.minuteLabel}
          hourOptions={[0, 1, 2, 3, 4, 5]}
          minuteOptions={[0, 15, 30, 45]}
          onHourChange={handleHourChange}
          onMinuteChange={handleMinuteChange}
          compact={compact}
        />
      </Box>
    </Fade>
  );
};

export default DurationSlider;
