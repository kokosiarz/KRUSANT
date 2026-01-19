import React from 'react';
import { Stack, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, TextField, Button } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import OccurrenceList from './OccurrenceList';

interface ReocurranceOptions {
  value: string;
  label: string;
}

interface BatchClassFormProps {
  selectedDate: any;
  setSelectedDate: (v: any) => void;
  selectedHour: any;
  setSelectedHour: (v: any) => void;
  reocurrance: string;
  setReocurrance: (v: string) => void;
  reocurranceOptions: ReocurranceOptions[];
  skipHolidays: boolean;
  setSkipHolidays: (v: boolean) => void;
  occurrencesCount: number;
  setOccurrencesCount: (v: number) => void;
  occurrences: string[];
  setOccurrences: (v: string[]) => void;
  handleGenerateOccurrences: () => void;
  handleOccurrenceDelete: (idx: number) => void;
  setCustomDialogOpen: (v: boolean) => void;
}

const BatchClassForm: React.FC<BatchClassFormProps> = ({
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  reocurrance,
  setReocurrance,
  reocurranceOptions,
  skipHolidays,
  setSkipHolidays,
  occurrencesCount,
  setOccurrencesCount,
  occurrences,
  setOccurrences,
  handleGenerateOccurrences,
  handleOccurrenceDelete,
  setCustomDialogOpen,
}) => (
  <Stack spacing={2}>
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
    {reocurrance !== 'none' && (
      <>
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
          onEdit={(idx, newDate) => {
            const updated = [...occurrences];
            updated[idx] = newDate;
            setOccurrences(updated);
          }}
          onDelete={handleOccurrenceDelete}
        />
      </>
    )}
  </Stack>
);

export default BatchClassForm;
