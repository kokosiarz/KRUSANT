import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Typography, Alert, CircularProgress } from '@mui/material';
import type { Class as ClassItem } from '@/api/endpoints/classes';

interface ConfirmationDialogProps {
  open: boolean;
  classesToCreate: Partial<ClassItem>[];
  roomNamesById: Record<number, string>;
  teacherNamesById: Record<number, string>;
  groupName?: string;
  creating?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  classesToCreate,
  roomNamesById,
  teacherNamesById,
  groupName,
  creating,
  error,
  onConfirm,
  onCancel,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
    <DialogTitle>Potwierdź utworzenie zajęć</DialogTitle>
    <DialogContent>
      <Typography variant="subtitle1" gutterBottom>
        Zostanie utworzonych {classesToCreate.length} zajęć{groupName ? ` dla grupy „${groupName}”` : ''}:
      </Typography>
      <List>
        {classesToCreate.map((cls, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={`Data: ${cls.startTime || ''}, Sala: ${(cls.roomId && roomNamesById[cls.roomId]) || 'brak'}, Nauczyciel: ${(cls.teacherId && teacherNamesById[cls.teacherId]) || 'brak'}`}
              secondary={`Długość: ${cls.lessonLength || ''}, Koszt: ${cls.cost ?? ''}`}
            />
          </ListItem>
        ))}
      </List>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={creating}>Anuluj</Button>
      <Button onClick={onConfirm} variant="contained" color="primary" disabled={creating}>
        {creating ? <CircularProgress size={20} /> : 'Zatwierdź'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
