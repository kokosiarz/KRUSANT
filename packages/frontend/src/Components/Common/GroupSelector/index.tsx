import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { groupsApi } from '@/api/endpoints/groups';
import type { Group } from '@/Components/Pages/Groups/types';

interface GroupSelectorProps {
  value?: number;
  onChange: (groupId: number) => void;
  label?: string;
  disabled?: boolean;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({ value, onChange, label = 'Grupa', disabled }) => {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  return (
    <FormControl fullWidth disabled={disabled || isLoading}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value ?? ''}
        label={label}
        onChange={e => onChange(Number(e.target.value))}
      >
        {isLoading && (
          <MenuItem value="">
            <CircularProgress size={20} />
          </MenuItem>
        )}
        {groups.map((group: Group) => (
          <MenuItem key={group.id} value={group.id}>
            {group.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default GroupSelector;
