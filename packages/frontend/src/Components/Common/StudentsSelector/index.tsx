import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { StudentsSelectorProps } from './types';
import { studentsApi } from '@api/endpoints/students';
import { useQuery } from '@tanstack/react-query';

const StudentsSelector: React.FC<StudentsSelectorProps> = ({ studentIds, setStudentIds, disabled, showInactive=false }) => {
  const { data: allStudents = [], error: queryError, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getStudents,
  });
  const selectedStudents = allStudents.filter(s => studentIds.includes(s.id));
  return (
    <Autocomplete
      multiple
      options={showInactive ? allStudents : allStudents.filter(s => s.active)}
      value={selectedStudents}
      onChange={(_e, vals) => setStudentIds(vals.map(s => s.id))}
      loading={!!isLoading}
      getOptionLabel={(option) => option.name || option.email || `Kursant ${option.id}`}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => {
          const tagProps = getTagProps({ index });
          const { key, ...restTagProps } = tagProps;
          return (
            <Chip
              key={option.id}
              label={option.name || option.email}
              {...restTagProps}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          multiline
          rows={2}
          label="Kursanci"
          placeholder="Wybierz kursantów"
          fullWidth
          disabled={disabled}
          helperText={queryError?.message}
          error={!!queryError || !!queryError}
        />
      )}
    />
  );
};

export default StudentsSelector;
