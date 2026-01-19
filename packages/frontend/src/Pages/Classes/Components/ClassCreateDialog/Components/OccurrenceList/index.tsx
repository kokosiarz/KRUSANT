import React, { useState } from 'react';
import { List, ListItem, ListItemText, IconButton, ListItemSecondaryAction, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { CalendarIcon } from '@mui/x-date-pickers';
import OccurrenceDateDialog from '../OccurrenceDateDialog';

interface OccurrenceListProps {
  occurrences: string[]; // ISO strings
  onEdit: (index: number, newDate: string) => void;
  onDelete: (index: number) => void;
}

const OccurrenceList: React.FC<OccurrenceListProps> = ({ occurrences, onEdit, onDelete }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [addMode, setAddMode] = useState(false);

  const handleOpenDialog = (idx: number) => {
    setEditingIdx(idx);
    setAddMode(false);
    setDialogOpen(true);
  };

  const handleAddOccurrence = () => {
    setEditingIdx(null);
    setAddMode(true);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingIdx(null);
    setAddMode(false);
  };

  const handleDateChange = (newDate: string) => {
    if (addMode) {
      // Add new occurrence if not already present
      if (!occurrences.some(d => d.slice(0, 10) === newDate.slice(0, 10))) {
        onEdit(occurrences.length, newDate);
      }
    } else if (editingIdx !== null) {
      onEdit(editingIdx, newDate);
    }
    handleCloseDialog();
  };

  // Mark all other dates as taken (except the one being edited or adding)
  const takenDates = (editingIdx !== null)
    ? occurrences.filter((_, i) => i !== editingIdx).map(d => d.slice(0, 10))
    : occurrences.map(d => d.slice(0, 10));

  // For add mode, pick today as default
  const todayIso = new Date().toISOString();
  const dialogValue = addMode ? todayIso : (editingIdx !== null ? occurrences[editingIdx] : todayIso);

  return (
    <>
      <List>
        {occurrences.map((date, idx) => (
          <ListItem key={date + idx} divider>
            <ListItemText
              primary={new Date(date).toLocaleString('pl-PL', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
              })}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(idx)}>
                <CalendarIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => onDelete(idx)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button onClick={handleAddOccurrence} variant="outlined" sx={{ mt: 1 }}>
        Dodaj termin
      </Button>
      {dialogOpen && (
        <OccurrenceDateDialog
          open={dialogOpen}
          value={dialogValue}
          takenDates={takenDates}
          onChange={handleDateChange}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default OccurrenceList;
