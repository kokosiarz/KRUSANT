import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

interface OccurrenceDateDialogProps {
  open: boolean;
  value: string; // ISO string
  takenDates: string[]; // ISO strings
  onChange: (date: string) => void;
  onClose: () => void;
}

const OccurrenceDateDialog: React.FC<OccurrenceDateDialogProps> = ({ open, value, takenDates, onChange, onClose }) => {
  const [selected, setSelected] = React.useState<Dayjs>(dayjs(value));

  React.useEffect(() => {
    setSelected(dayjs(value));
  }, [value]);

  const handleAccept = () => {
    if (selected && !takenDates.includes(selected.format('YYYY-MM-DD'))) {
      onChange(selected.toISOString());
      onClose();
    }
  };

  const shouldDisableDate = (date: Dayjs) => {
    return takenDates.includes(date.format('YYYY-MM-DD'));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Wybierz nową datę</DialogTitle>
      <DialogContent>
        <DateCalendar
          value={selected}
          onChange={date => { if (date) setSelected(date); }}
          shouldDisableDate={shouldDisableDate}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button onClick={handleAccept} variant="contained" disabled={shouldDisableDate(selected)}>Zatwierdź</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OccurrenceDateDialog;
