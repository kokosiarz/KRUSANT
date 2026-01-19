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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


interface AddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; date: string; comment?: string; studentId: number; proofType: 'receipt' | 'invoice'; fiscalized: boolean }) => void;
}


const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({ open, onClose, onSubmit }) => {


  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [proofType, setProofType] = useState<'receipt' | 'invoice'>('receipt');
  const [fiscalized, setFiscalized] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getStudents,
  });

  const handleSubmit = () => {
    if (!amount || !date || !studentId || !proofType) return;
    onSubmit({ amount: parseFloat(amount), date, comment, studentId: Number(studentId), proofType, fiscalized: Boolean(fiscalized) });
    setAmount('');
    setDate('');
    setComment('');
    setStudentId('');
    setProofType('receipt');
    setFiscalized(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Dodaj wpłatę</DialogTitle>
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
          label="Data"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="proof-type-label">Typ dowodu</InputLabel>
          <Select
            labelId="proof-type-label"
            value={proofType}
            label="Typ dowodu"
            onChange={e => setProofType(e.target.value as 'receipt' | 'invoice')}
          >
            <MenuItem value="receipt">Paragon</MenuItem>
            <MenuItem value="invoice">Faktura</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Komentarz"
          value={comment}
          onChange={e => setComment(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={<Checkbox checked={fiscalized} onChange={e => setFiscalized(e.target.checked)} />}
          label="Zafiskalizowano"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button onClick={handleSubmit} variant="contained">Dodaj</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentDialog;
