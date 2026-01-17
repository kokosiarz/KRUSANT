import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { StepColorProps } from './types';
import { copy } from './copy';
import './styles.css';
import { EMode } from '@components/GroupWizard/types';


const ColorPicker: React.FC<StepColorProps> = ({ colorHex, setColorHex, mode }) => {
  const subtitle = mode === EMode.CreateGroup || mode === EMode.EditGroup
    ? 'Kolor ułatwia wizualną identyfikację grup.'
    : copy.subtitle;

  return (
    <Fade in={true} timeout={300}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
        <Box className="colorGrid">
          {copy.colors.map((color) => (
            <Box
              key={color.value}
              className="colorSwatch"
              onClick={() => setColorHex(color.value)}
              sx={{
                backgroundColor: color.value,
                borderColor: colorHex === color.value ? 'primary.main' : 'transparent',
                '&:hover': {
                  transform: 'scale(1.1)',
                  borderColor: 'primary.light',
                  boxShadow: 2,
                },
              }}
              title={color.name}
            />
          ))}
        </Box>
      </Box>
    </Fade>
  );
};

export default ColorPicker;
