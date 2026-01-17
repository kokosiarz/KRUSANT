import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { StepSelectTemplateProps } from './types';
import { copy } from './copy';

const TemplatePicker: React.FC<StepSelectTemplateProps> = ({ templates, selectedTemplateId, setTemplateId }) => {
  return (
    <Fade in timeout={300}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {copy.description}
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>{copy.template}</InputLabel>
          <Select
            name="templateId"
            value={selectedTemplateId ?? ''}
            onChange={(e) => setTemplateId(e.target.value as number)}
            label={copy.template}
          >
            <MenuItem value="">{copy.noTemplate}</MenuItem>
            {templates.map((template: any) => (
              <MenuItem key={template.id} value={template.id}>
                {template.templateName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Fade>
  );
};

export default TemplatePicker;
