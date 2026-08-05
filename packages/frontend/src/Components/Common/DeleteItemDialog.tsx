import React, { useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { haptics } from '@/utils/haptics';

export interface DeleteItemDialogProps {
  open: boolean;
  itemName?: string;
  deleting: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({
  open,
  itemName,
  deleting,
  error,
  onCancel,
  onConfirm,
}) => {
  // Every destructive confirmation in the app comes through this dialog, so
  // one buzz here covers all of them. It fires on the ask, not on the delete —
  // the point is to catch the eye before the tap, not to celebrate after.
  useEffect(() => {
    if (open) haptics.warn();
  }, [open]);

  return (
  <Dialog
    open={open}
    onClose={onCancel}
    aria-labelledby="delete-dialog-title"
  >
    <DialogTitle id="delete-dialog-title">
      Potwierdzenie usunięcia
    </DialogTitle>
    <DialogContent>
      <Typography>
        Czy na pewno chcesz usunąć <strong>{itemName}</strong>?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Ta operacja nie może być cofnięta.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={deleting}>
        Anuluj
      </Button>
      <Button onClick={onConfirm} color="error" variant="contained" disabled={deleting}>
        {deleting ? <CircularProgress size={24} /> : 'Usuń'}
      </Button>
    </DialogActions>
  </Dialog>
  );
};

export default DeleteItemDialog;
