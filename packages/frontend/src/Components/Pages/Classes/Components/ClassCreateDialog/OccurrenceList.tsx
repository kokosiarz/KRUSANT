import React from 'react';
import { List, ListItem, ListItemText, IconButton, ListItemSecondaryAction } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface OccurrenceListProps {
  occurrences: string[]; // ISO strings
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const OccurrenceList: React.FC<OccurrenceListProps> = ({ occurrences, onEdit, onDelete }) => (
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
          <IconButton edge="end" aria-label="edit" onClick={() => onEdit(idx)}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={() => onDelete(idx)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ))}
  </List>
);

export default OccurrenceList;
