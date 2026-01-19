import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface Props {
  filters: string[];
  onFilterChange: (newFilters: string[]) => void;
  onAddGroup: () => void;
}

const GroupsHeader: React.FC<Props> = ({ filters, onFilterChange, onAddGroup }) => {
  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilters: string[]) => {
    if (newFilters.length === 0) {
      onFilterChange(['all']);
      return;
    }
    if (newFilters.includes('all') && !filters.includes('all')) {
      onFilterChange(['all']);
      return;
    }
    if (newFilters.includes('all') && newFilters.length > 1) {
      onFilterChange(newFilters.filter(f => f !== 'all'));
      return;
    }
    onFilterChange(newFilters);
  };

  return (
      <Box className="header-controls">
        <ToggleButtonGroup
          value={filters}
          onChange={handleFilterChange}
          aria-label="filtr grup"
          size="small"
        >
          <ToggleButton value="all" aria-label="wszystkie grupy">
            Wszystkie
          </ToggleButton>
          <ToggleButton value="active" aria-label="aktywne grupy">
            Aktywne
          </ToggleButton>
        </ToggleButtonGroup>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddGroup}>
          Dodaj grupę
        </Button>
      </Box>
  );
};

export default GroupsHeader;
