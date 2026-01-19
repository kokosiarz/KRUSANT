import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { Class as ClassItem } from '@/api/endpoints/classes';

interface ConfirmationDialogProps {
  open: boolean;
  classesToCreate: Partial<ClassItem>[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, classesToCreate, onConfirm, onCancel }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
    <DialogTitle>Potwierdź utworzenie zajęć</DialogTitle>
    <DialogContent>
      <Typography variant="subtitle1" gutterBottom>
        Zostaną utworzone następujące zajęcia:
      </Typography>
      <List>
        {classesToCreate.map((cls, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={`Data: ${cls.startTime || ''}, Sala: ${cls.roomId || ''}, Nauczyciel: ${cls.teacherId || ''}`}
              secondary={`Grupa: ${cls.groupId || ''}, Długość: ${cls.lessonLength || ''}, Koszt: ${cls.cost || ''}`}
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Anuluj</Button>
      <Button onClick={onConfirm} variant="contained" color="primary">Zatwierdź</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
