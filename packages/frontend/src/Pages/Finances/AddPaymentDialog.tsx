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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';


interface AddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; date: string; comment?: string; studentId: number; proofType: 'receipt' | 'invoice'; fiscalized: boolean }) => void;
  submitting?: boolean;
  error?: string | null;
  /**
   * Pre-selects and locks the student. Set when the dialog is opened from a
   * specific student's row, where re-picking them from a dropdown would be
   * pointless and easy to get wrong.
   */
  lockedStudentId?: number;
  lockedStudentName?: string;
}


const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({ open, onClose, onSubmit, submitting, error, lockedStudentId, lockedStudentName }) => {


  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [studentId, setStudentId] = useState(lockedStudentId ? String(lockedStudentId) : '');

  // Today by default and the locked student applied whenever the dialog opens:
  // a quick-add is meant to be two fields and done.
  React.useEffect(() => {
    if (!open) return;
    if (lockedStudentId) setStudentId(String(lockedStudentId));
    setDate((prev) => prev || new Date().toISOString().slice(0, 10));
  }, [open, lockedStudentId]);
  const [proofType, setProofType] = useState<'receipt' | 'invoice'>('receipt');
  const [fiscalized, setFiscalized] = useState(false);
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
    if (!date || !studentId || !proofType) return;
    setAmountError(false);
    onSubmit({ amount: parsedAmount, date, comment, studentId: Number(studentId), proofType, fiscalized: Boolean(fiscalized) });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {lockedStudentName ? `Dodaj wpłatę — ${lockedStudentName}` : 'Dodaj wpłatę'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!lockedStudentId && (
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
        )}
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
          label="Data"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          fullWidth
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
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
        <Button onClick={onClose} disabled={submitting}>Anuluj</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentDialog;
