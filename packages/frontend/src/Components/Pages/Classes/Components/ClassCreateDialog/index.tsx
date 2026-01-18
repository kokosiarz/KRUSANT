
import React, { useState } from 'react';
import {
  Dialog, DialogContent, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, TextField, Box, Button, Stack, Typography, DialogActions, DialogTitle, Checkbox, FormGroup
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useQueryClient } from '@tanstack/react-query';
import type { Class as ClassItem } from '@/api/endpoints/classes';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';
import dayjs, { Dayjs } from 'dayjs';
import { generateOccurrences } from './generateOccurrences';
import 'dayjs/locale/pl';
import OccurrenceList from './OccurrenceList';
import { GroupSelector } from '@/Components/Common/GroupSelector';

interface ClassCreationDialogProps {
  open: boolean;
  initialDate?: string; // ISO string date
  onClose?: () => void;
}


export const ClassCreationDialog: React.FC<ClassCreationDialogProps> = ({ open, onClose, initialDate = new Date().toISOString() }) => {
  const queryClient = useQueryClient();
  const saving = false; // Placeholder for saving state
  const isLoading = false;
  const error = undefined;

  // Reocurrence options
  const reocurranceOptions = [
    { value: 'none', label: 'Brak' },
    { value: 'everyday', label: 'Codziennie' },
    { value: 'weekends', label: 'Weekend' },
    { value: 'workdays', label: 'Dni robocze' },
    { value: 'onceAWeek', label: 'Raz w tygodniu' },
    { value: 'custom', label: 'Wybierz dni tygodnia...' },
  ];

  // Parse initial date and hour
  const initialDayjs = initialDate ? dayjs(initialDate) : dayjs();
  const defaultHour = (initialDayjs.hour() === 0 && initialDayjs.minute() === 0) ? initialDayjs.hour(9).minute(0) : initialDayjs;

  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDayjs);
  const [selectedHour, setSelectedHour] = useState<Dayjs>(defaultHour);
  const [reocurrance, setReocurrance] = useState('everyday');
  const [customDays, setCustomDays] = useState<number[]>([]); // 0=Sunday, 1=Monday...
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [occurrencesCount, setOccurrencesCount] = useState(10);
  const [occurrences, setOccurrences] = useState<string[]>([]); // ISO strings
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  // Weekday names in Polish
  const weekDays = [
    'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'
  ];

  // Use imported generateOccurrences function
  const handleGenerateOccurrences = () => {
    const occ = generateOccurrences(
      selectedDate,
      selectedHour,
      reocurrance as any,
      customDays,
      occurrencesCount,
      skipHolidays
    );
    setOccurrences(occ);
  };

  // Clear state on close
  const handleClose = () => {
    setSelectedDate(initialDayjs);
    setSelectedHour(defaultHour);
    setReocurrance('everyday');
    setCustomDays([]);
    setSkipHolidays(true);
    setOccurrencesCount(10);
    setOccurrences([]);
    setCustomDialogOpen(false);
    if (onClose) onClose();
  };

  // Custom days dialog content
  const handleCustomDayToggle = (idx: number) => {
    setCustomDays(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle>Tworzenie zajęć</DialogTitle>
        <LoadingErrorHandler loading={isLoading} >
          <DialogContent>
            <Stack spacing={2}>
              <GroupSelector value={undefined} onChange={() => {}} />
              <DatePicker
                label="Data początkowa"
                value={selectedDate}
                onChange={v => v && setSelectedDate(v)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="Godzina zajęć"
                value={selectedHour}
                onChange={v => v && setSelectedHour(v)}
                ampm={false}
                format="HH:mm"
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel id="reocurrance-type-label">Powtarzanie</InputLabel>
                <Select
                  labelId="reocurrance-type-label"
                  value={reocurrance}
                  label="Powtarzanie"
                  onChange={e => {
                    setReocurrance(e.target.value);
                    if (e.target.value === 'custom') setCustomDialogOpen(true);
                  }}
                >
                  {reocurranceOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={skipHolidays} onChange={e => setSkipHolidays(e.target.checked)} />}
                label="Pomiń święta"
              />
              <TextField
                label="Liczba wystąpień"
                type="number"
                value={occurrencesCount}
                onChange={e => setOccurrencesCount(Number(e.target.value))}
                inputProps={{ min: 1, max: 100 }}
                fullWidth
              />
              <Button variant="contained" onClick={handleGenerateOccurrences}>Generuj terminy</Button>
              <OccurrenceList
                occurrences={occurrences}
                onEdit={idx => {}}
                onDelete={idx => setOccurrences(occurrences.filter((_, i) => i !== idx))}
              />
            </Stack>
            {/* Custom days dialog */}
            <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)}>
              <DialogTitle>Wybierz dni tygodnia</DialogTitle>
              <DialogContent>
                <FormGroup>
                  {weekDays.map((name, idx) => (
                    <FormControlLabel
                      key={name}
                      control={
                        <Checkbox
                          checked={customDays.includes(idx)}
                          onChange={() => handleCustomDayToggle(idx)}
                        />
                      }
                      label={name}
                    />
                  ))}
                </FormGroup>
                <DialogActions>
                  <Button onClick={() => setCustomDialogOpen(false)}>OK</Button>
                </DialogActions>
              </DialogContent>
            </Dialog>
          </DialogContent>
        </LoadingErrorHandler>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ClassCreationDialog;
