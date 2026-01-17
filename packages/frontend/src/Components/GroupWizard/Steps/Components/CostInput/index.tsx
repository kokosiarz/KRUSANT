import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { StepCostProps, ECostMode } from './types';
import { copy } from './copy';

const CostInput: React.FC<StepCostProps> = ({ cost, setCost, currency, mode }) => {
  const content = mode === ECostMode.unit ? copy.unit : copy.base;

  return (
    <Fade in={true} timeout={300}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {content.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {content.subtitle}
        </Typography>
        <TextField
          label={`${content.label} (${currency})`}
          name={mode === ECostMode.unit ? 'unitCost' : 'cost'}
          type="number"
          value={cost}
          onChange={e => setCost(Number(e.target.value))}
          fullWidth
          size="small"
          inputProps={{ step: '0.01' }}
        />
      </Box>
    </Fade>
  );
};

export default CostInput;
