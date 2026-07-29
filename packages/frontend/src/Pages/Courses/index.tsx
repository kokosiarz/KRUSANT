import React from 'react';
import SimpleCrudPage from '@/Components/Common/SimpleCrudPage';
import { coursesApi } from '@/api/endpoints/courses';
import { Course } from '@/api/types/course';
import { useSettings } from '@/context/Settings';

const PATTERN_LABELS: Record<string, string> = {
  workdays: 'Dni robocze',
  weekends: 'Weekendy',
  everyday: 'Codziennie',
  weekly: 'Raz w tygodniu',
  biweekly: 'Co dwa tygodnie',
  monthly: 'Raz w miesiącu',
};

const Courses: React.FC = () => {
  const { currency } = useSettings();

  return (
    <SimpleCrudPage<Course>
      title="Kursy"
      queryKey="courses"
      entityLabelAccusative="kurs"
      getItemName={(c) => c.name || `#${c.id}`}
      fields={[
        { key: 'name', label: 'Nazwa', type: 'text', required: true },
        { key: 'description', label: 'Opis', type: 'text' },
        {
          key: 'cost',
          label: `Całkowity koszt (${currency})`,
          type: 'number',
          required: true,
          min: 0,
        },
        {
          key: 'numberOfHours',
          label: 'Łączna liczba godzin',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          key: 'lessonLength',
          label: 'Długość zajęć',
          type: 'text',
          required: true,
          helperText: 'Format GG:MM, np. 02:30',
        },
        {
          key: 'pattern',
          label: 'Częstotliwość zajęć',
          type: 'select',
          required: true,
          options: Object.entries(PATTERN_LABELS).map(([value, label]) => ({ value, label })),
          format: (value) => PATTERN_LABELS[value] ?? value,
        },
      ]}
      api={{
        getAll: coursesApi.getCourses,
        create: (data) => coursesApi.createCourse(data as any),
        update: (id, data) => coursesApi.updateCourse(id, data),
        remove: coursesApi.deleteCourse,
      }}
    />
  );
};

export default Courses;
