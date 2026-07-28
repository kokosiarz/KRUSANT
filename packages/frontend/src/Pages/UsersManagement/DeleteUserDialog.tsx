import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AdminUser } from '@/api/endpoints/usersAdmin';

interface DeleteUserDialogProps {
  open: boolean;
  user: AdminUser | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, user, loading, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Usuń użytkownika</DialogTitle>
    <DialogContent>
      <Typography>
        Czy na pewno chcesz usunąć użytkownika <strong>{user?.email}</strong>?
      </Typography>
      <Typography color="error" sx={{ mt: 1 }}>
        Ta operacja jest nieodwracalna.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Anuluj
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : 'Usuń'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteUserDialog;
