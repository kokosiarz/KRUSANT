import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AdminUser } from '@/api/endpoints/usersAdmin';

interface ResetPasswordDialogProps {
  open: boolean;
  user: AdminUser | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, user, loading, onClose, onSubmit }) => {
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (open) setNewPassword('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Resetuj hasło</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Resetowanie hasła dla użytkownika: <strong>{user?.email}</strong>
        </Typography>
        <TextField
          fullWidth
          label="Nowe hasło"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          helperText="Minimum 6 znaków"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anuluj
        </Button>
        <Button
          onClick={() => onSubmit(newPassword)}
          variant="contained"
          disabled={loading || newPassword.length < 6}
        >
          {loading ? <CircularProgress size={20} /> : 'Resetuj hasło'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
