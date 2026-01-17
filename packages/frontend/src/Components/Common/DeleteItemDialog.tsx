import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface DeleteItemDialogProps {
  open: boolean;
  itemName?: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({
  open,
  itemName,
  deleting,
  onCancel,
  onConfirm,
}) => (
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

export default DeleteItemDialog;
