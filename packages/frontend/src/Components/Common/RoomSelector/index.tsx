import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { copy } from './copy';
import { Room } from '@/api/types/room';

export interface StepRoomProps {
  compact?: boolean;
  roomsList: Room[];
  roomId: number | undefined;
  setRoomId: (roomId: number | undefined) => void;
}

const RoomSelector: React.FC<StepRoomProps> = ({ roomsList, roomId, setRoomId, compact }) => {
  return (
    <Fade in={true} timeout={300}>
      <Box>
        {!compact && <>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {copy.subtitle}
        </Typography>
        </>}
        <FormControl fullWidth size="small">
          <InputLabel>{copy.label}</InputLabel>
          <Select
            name="roomId"
            value={roomId ?? ''}
            onChange={e => {
              const value = e.target.value;
              setRoomId(value);
            }}
            label={copy.label}
          >
            <MenuItem value="">{copy.noRoom}</MenuItem>
            {roomsList.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name} {room.capacity ? `(${room.capacity})` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Fade>
  );
};

export default RoomSelector;
