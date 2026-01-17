import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { copy } from './copy';
import { EMode } from '../../../types';


interface NameInputProps {
  mode: EMode;
  name: string;
  setName: (name: string) => void;
  error?: string | null;
  loading?: boolean;
}

const NameInput: React.FC<NameInputProps> = ({ mode, name, setName, error, loading }) => {
  const isGroupMode = mode === EMode.CreateGroup || mode === EMode.EditGroup;
  return (
    <Fade in={true} timeout={300}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {isGroupMode ? copy.groupTitle : copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isGroupMode ? copy.groupSubtitle : copy.subtitle}
        </Typography>
        <TextField
          label={copy.label}
          name="name"
          value={name || ''}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          placeholder={copy.placeholder}
          autoFocus
          error={!!error}
          helperText={error}
          disabled={!!loading}
        />
      </Box>
    </Fade>
  );
};

export default NameInput;
