import React from 'react';
import SimpleCrudPage from '@/Components/Common/SimpleCrudPage';
import { teachersApi, Teacher } from '@/api/endpoints/teachers';

const Teachers: React.FC = () => (
  <SimpleCrudPage<Teacher>
    title="Nauczyciele"
    queryKey="teachers"
    entityLabelAccusative="nauczyciela"
    getItemName={(t) => t.name || t.email || `#${t.id}`}
    fields={[
      { key: 'name', label: 'Imię i nazwisko', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
    ]}
    api={{
      getAll: teachersApi.getTeachers,
      create: (data) => teachersApi.createTeacher(data as any),
      update: (id, data) => teachersApi.updateTeacher(id, data),
      remove: teachersApi.deleteTeacher,
    }}
  />
);

export default Teachers;
