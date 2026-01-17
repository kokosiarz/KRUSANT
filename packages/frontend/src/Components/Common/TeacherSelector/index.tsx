import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { StepTeacherProps } from './types';
import { copy } from './copy';

const TeacherSelector: React.FC<StepTeacherProps> = ({ teacherId, teacherList, setTeacherId, compact = false }) => {
  return (
    <Fade in={true} timeout={300}>
      <Box>
        {compact ? (
          <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{copy.label}</InputLabel>
            <Select
              name="teacherId"
              value={typeof teacherId === 'number' ? String(teacherId) : ''}
              onChange={(e) => {
                const val = e.target.value as unknown as string;
                setTeacherId(val === '' ? undefined : Number(val));
              }}
              label={copy.label}
            >
              <MenuItem value="">{copy.noTeacher}</MenuItem>
              {teacherList.map((teacher: any) => (
                <MenuItem key={teacher.id} value={String(teacher.id)}>
                  {teacher.firstName && teacher.lastName
                    ? `${teacher.firstName} ${teacher.lastName}`
                    : teacher.name || `${copy.fallbackPrefix} ${teacher.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {copy.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {copy.subtitle}
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>{copy.label}</InputLabel>
              <Select
                name="teacherId"
                value={typeof teacherId === 'number' ? String(teacherId) : ''}
                onChange={(e) => {
                  const val = e.target.value as unknown as string;
                  setTeacherId(val === '' ? undefined : Number(val));
                }}
                label={copy.label}
              >
                <MenuItem value="">{copy.noTeacher}</MenuItem>
                {teacherList.map((teacher: any) => (
                  <MenuItem key={teacher.id} value={String(teacher.id)}>
                    {teacher.firstName && teacher.lastName
                      ? `${teacher.firstName} ${teacher.lastName}`
                      : teacher.name || `${copy.fallbackPrefix} ${teacher.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </Box>
    </Fade>
  );
};

export default TeacherSelector;
