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

interface AddDebitDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; dueDate: string; comment?: string; studentId: number }) => void;
}

const AddDebitDialog: React.FC<AddDebitDialogProps> = ({ open, onClose, onSubmit }) => {

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comment, setComment] = useState('');
  const [studentId, setStudentId] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getStudents,
  });

  const handleSubmit = () => {
    if (!amount || !dueDate || !studentId) return;
    onSubmit({ amount: parseFloat(amount), dueDate, comment, studentId: Number(studentId) });
    setAmount('');
    setDueDate('');
    setComment('');
    setStudentId('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Dodaj obciążenie</DialogTitle>
      <DialogContent>
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
          onChange={e => setAmount(e.target.value)}
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
          InputLabelProps={{ shrink: true }}
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
        <Button onClick={onClose}>Anuluj</Button>
        <Button onClick={handleSubmit} variant="contained">Dodaj</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDebitDialog;
