import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

interface CustomDaysDialogProps {
  open: boolean;
  weekDays: string[];
  customDays: number[];
  onToggle: (idx: number) => void;
  onClose: () => void;
}

const CustomDaysDialog: React.FC<CustomDaysDialogProps> = ({ open, weekDays, customDays, onToggle, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Wybierz dni tygodnia</DialogTitle>
    <DialogContent>
      <FormGroup>
        {weekDays.map((name, idx) => (
          <FormControlLabel
            key={name}
            control={
              <Checkbox
                checked={customDays.includes(idx)}
                onChange={() => onToggle(idx)}
              />
            }
            label={name}
          />
        ))}
      </FormGroup>
      <DialogActions>
        <Button onClick={onClose}>OK</Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
);

export default CustomDaysDialog;
