import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import type { Group } from '@/Pages/Groups/types';
import { groupsApi } from '@/api/endpoints/groups';

interface GroupSelectorProps {
  value?: Group | null;
  onChange: (group: Group | null) => void;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({ value, onChange }) => {
  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  if (isLoading) return <CircularProgress size={24} />;
  if (error) return <div>Błąd ładowania grup</div>;

  return (
    <FormControl fullWidth>
      <InputLabel id="group-selector-label">Grupa</InputLabel>
      <Select
        labelId="group-selector-label"
        value={value ? value.id : ''}
        label="Grupa"
        onChange={e => {
          const selected = groups?.find((g: Group) => g.id === e.target.value) || null;
          onChange(selected);
        }}
      >
        <MenuItem value="">Brak</MenuItem>
        {groups?.map((group: Group) => (
          <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default GroupSelector;
