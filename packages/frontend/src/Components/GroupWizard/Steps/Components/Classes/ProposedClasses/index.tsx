import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ProposedClassesProps } from './types';

const ProposedClasses: React.FC<ProposedClassesProps> = ({
  proposedDates,
  proposedDateObjects,
  onDateChange,
  onDateRemove
}) => {
  if (!proposedDates || proposedDates.length === 0) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" gutterBottom>
          Zajęcia ({proposedDates.length})
        </Typography>
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {proposedDates.map((date, index) => {
            // Safety check: ensure the date object exists
            const dateObject = proposedDateObjects[index];
            if (!dateObject) return null;

            return (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="usuń"
                    onClick={() => onDateRemove(index)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 70 }}>
                    Zajęcia {index + 1}
                  </Typography>
                  <DateTimePicker
                    value={dayjs(dateObject)}
                    onChange={(newValue) => {
                      if (newValue) {
                        const jsDate = newValue.toDate();
                        if (!isNaN(jsDate.getTime())) {
                          onDateChange(index, jsDate);
                        }
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { flex: 1 }
                      }
                    }}
                  />
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </LocalizationProvider>
  );
};

export default ProposedClasses;
