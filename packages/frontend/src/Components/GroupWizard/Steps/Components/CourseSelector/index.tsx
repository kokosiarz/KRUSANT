import React from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { StepCourseProps } from './types';
import { copy } from './copy';

const CourseSelector: React.FC<StepCourseProps> = ({ courses, courseId, setCourseId }) => {
  return (
    <Fade in={true} timeout={300}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {copy.subtitle}
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>{copy.selectLabel}</InputLabel>
          <Select
            name="courseId"
            value={typeof courseId === 'number' ? String(courseId) : ''}
            onChange={e => {
              const val = e.target.value as unknown as string;
              const value = val === '' ? undefined : Number(val);
              setCourseId(value);
            }}
            label={copy.selectLabel}
          >
            <MenuItem value="">{copy.selectPlaceholder}</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {courseId && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {copy.helper}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default CourseSelector;
