import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '@/api/endpoints/students';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

interface AddDebitDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; dueDate: string; comment?: string; studentId: number }) => void;
  submitting?: boolean;
  error?: string | null;
}

const AddDebitDialog: React.FC<AddDebitDialogProps> = ({ open, onClose, onSubmit, submitting, error }) => {

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comment, setComment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [amountError, setAmountError] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getStudents,
  });

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError(true);
      return;
    }
    if (!dueDate || !studentId) return;
    setAmountError(false);
    onSubmit({ amount: parsedAmount, dueDate, comment, studentId: Number(studentId) });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Dodaj obciążenie</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel id="student-label">Kursant</InputLabel>
          <Select
            labelId="student-label"
            value={studentId}
            label="Kursant"
            onChange={e => setStudentId(e.target.value)}
          >
            {students.map((s: any) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Kwota"
          type="number"
          value={amount}
          onChange={e => { setAmount(e.target.value); setAmountError(false); }}
          error={amountError}
          helperText={amountError ? 'Podaj kwotę większą od zera' : ''}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Termin"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          fullWidth
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Komentarz"
          value={comment}
          onChange={e => setComment(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Anuluj</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDebitDialog;
