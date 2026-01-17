import React from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

export interface HeaderButtonsProps {
  filters: string[];
  onFilterChange: (event: React.MouseEvent<HTMLElement>, newFilters: string[]) => void;
  onAdd: () => void;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({ filters, onFilterChange, onAdd }) => (
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    <ToggleButtonGroup
      value={filters}
      onChange={onFilterChange}
      aria-label="filtr szablonów"
      size="small"
    >
      <ToggleButton value="all" aria-label="wszystkie szablony">
        Wszystkie
      </ToggleButton>
      <ToggleButton value="active" aria-label="aktywne szablony">
        Aktywne
      </ToggleButton>
    </ToggleButtonGroup>
    <Button
      variant="outlined"
      startIcon={<AddIcon />}
      onClick={onAdd}
    >
      Dodaj szablon
    </Button>
  </Box>
);

export default HeaderButtons;
