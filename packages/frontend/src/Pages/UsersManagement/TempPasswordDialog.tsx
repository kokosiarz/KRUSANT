import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IssuedCredentials } from '@/api/endpoints/usersAdmin';

interface TempPasswordDialogProps {
  result: IssuedCredentials | null;
  onClose: () => void;
}

const formatExpiry = (iso: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));

/**
 * Shown only when the email failed to send. This is the single moment the
 * temporary password can still be read — it is not stored in recoverable form,
 * so once this dialog closes the only way to get one is another reset.
 */
const TempPasswordDialog: React.FC<TempPasswordDialogProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!result?.tempPassword) return;
    void navigator.clipboard.writeText(result.tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const open = Boolean(result?.tempPassword);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nie udało się wysłać e-maila</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Konto <strong>{result?.user.email}</strong> zostało utworzone, ale
          wiadomość nie została wysłana
          {result?.emailError ? `: ${result.emailError}` : '.'}
        </Alert>

        <Typography variant="body2" sx={{ mb: 1 }}>
          Przekaż użytkownikowi to hasło tymczasowe w bezpieczny sposób. Nie
          będzie już możliwości jego odczytania.
        </Typography>

        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: 'action.hover',
            fontFamily: 'monospace',
            fontSize: 22,
            letterSpacing: 1,
            wordBreak: 'break-all',
          }}
        >
          {result?.tempPassword}
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 2 }}>
          <Button size="small" startIcon={<ContentCopyIcon />} onClick={copy}>
            {copied ? 'Skopiowano' : 'Kopiuj'}
          </Button>
          {result && (
            <Typography variant="caption" color="text.secondary">
              Ważne do: {formatExpiry(result.tempPasswordExpiresAt)}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TempPasswordDialog;
