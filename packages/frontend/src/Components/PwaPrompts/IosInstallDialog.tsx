import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IosShareIcon from '@mui/icons-material/IosShare';

/**
 * How to install on iOS, where there is no install dialog to open — Safari has
 * never fired `beforeinstallprompt`, so the Share sheet is the only route and
 * the user has to be walked to it. Shared by the install banner and the profile
 * panel's install entry.
 */
const IosInstallDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Instalacja na iPhone / iPad</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Safari nie pozwala zainstalować aplikacji jednym przyciskiem — trzeba
        zrobić to z menu udostępniania.
      </Typography>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <IosShareIcon fontSize="small" color="primary" />
          <Typography variant="body2">
            1. Dotknij ikony <strong>Udostępnij</strong> na dole ekranu.
          </Typography>
        </Stack>
        <Typography variant="body2">
          2. Wybierz <strong>Do ekranu początkowego</strong>.
        </Typography>
        <Typography variant="body2">
          3. Potwierdź przyciskiem <strong>Dodaj</strong>.
        </Typography>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Zamknij</Button>
    </DialogActions>
  </Dialog>
);

export default IosInstallDialog;
