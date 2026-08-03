import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { AdminUser } from '@/api/endpoints/usersAdmin';

interface ResetPasswordDialogProps {
  open: boolean;
  user: AdminUser | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

// A confirmation, not a form: the admin no longer picks the password. The
// server generates a temporary one, emails it, and the user must change it
// within 24h.
const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  user,
  loading,
  onClose,
  onSubmit,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Resetuj hasło</DialogTitle>
    <DialogContent>
      <Typography sx={{ mb: 2 }}>
        Wygenerować nowe hasło tymczasowe dla użytkownika{' '}
        <strong>{user?.email}</strong>?
      </Typography>
      <Alert severity="info">
        Dotychczasowe hasło przestanie działać natychmiast. Nowe hasło zostanie
        wysłane e-mailem i będzie ważne przez 24 godziny.
      </Alert>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Anuluj
      </Button>
      <Button onClick={onSubmit} variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : 'Resetuj hasło'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ResetPasswordDialog;
