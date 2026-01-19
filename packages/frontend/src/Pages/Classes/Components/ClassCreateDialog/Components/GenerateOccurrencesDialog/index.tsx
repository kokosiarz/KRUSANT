import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Switch, TextField, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

interface ReocurranceOption {
  value: string;
  label: string;
}

interface GenerateOccurrencesDialogProps {
  open: boolean;
  selectedDate: any;
  setSelectedDate: (v: any) => void;
  reocurrance: string;
  setReocurrance: (v: string) => void;
  reocurranceOptions: ReocurranceOption[];
  setCustomDialogOpen: (v: boolean) => void;
  skipHolidays: boolean;
  setSkipHolidays: (v: boolean) => void;
  occurrencesCount: number;
  setOccurrencesCount: (v: number) => void;
  onGenerate: () => void;
  onClose: () => void;
}

const GenerateOccurrencesDialog: React.FC<GenerateOccurrencesDialogProps> = ({
  open,
  selectedDate,
  setSelectedDate,
  reocurrance,
  setReocurrance,
  reocurranceOptions,
  setCustomDialogOpen,
  skipHolidays,
  setSkipHolidays,
  occurrencesCount,
  setOccurrencesCount,
  onGenerate,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Generuj terminy</DialogTitle>
    <DialogContent>
      <InputLabel id="reocurrance-type-label">Powtarzanie</InputLabel>
      <Select
        labelId="reocurrance-type-label"
        value={reocurrance}
        label="Powtarzanie"
        onChange={e => {
          setReocurrance(e.target.value);
          if (e.target.value === 'custom') setCustomDialogOpen(true);
        }}
        fullWidth
        sx={{ mb: 2 }}
      >
        {reocurranceOptions.map((opt: ReocurranceOption) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
      <DatePicker
        label="Data początkowa"
        value={selectedDate}
        onChange={v => v && setSelectedDate(v)}
        format="DD-MM-YYYY"
      />
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
        sx={{ mt: 2 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Anuluj</Button>
      <Button onClick={onGenerate} variant="contained">Generuj</Button>
    </DialogActions>
  </Dialog>
);

export default GenerateOccurrencesDialog;
