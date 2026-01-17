import React from 'react';
import TeacherSelector from '@/Components/Common/TeacherSelector';
import { useQuery } from '@tanstack/react-query';
import { teachersApi } from '../../../../../api/endpoints/teachers';
import { useGroupWizardData } from '../../../Context/GroupWizardDataContext';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';

const TeacherSelectorWrapper: React.FC = () => {
  const { formData, setFormData } = useGroupWizardData();
  const { data: teacherList = [], isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: teachersApi.getTeachers,
  });

  const teacherId = typeof formData.teacherId === 'number' ? formData.teacherId : undefined;

  const setTeacherId = (id: number | undefined) => setFormData({ ...formData, teacherId: id });

  return (
    <LoadingErrorHandler loading={isLoading} error={error?.message}>
      <TeacherSelector
        teacherList={teacherList}
        teacherId={teacherId}
        setTeacherId={setTeacherId}
      />
    </LoadingErrorHandler>
  );
};

export default TeacherSelectorWrapper;
