import React from 'react';
import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/api/endpoints/courses';
import CourseSelector from '../../Components/CourseSelector';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';

const CourseSelectorWrapper: React.FC = () => {
  const { formData, setFormData } = useGroupWizardData();
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getCourses,
  });

  const courseId = typeof formData.courseId === 'number' ? formData.courseId : undefined;

  const setCourseId = (id: number | undefined) => {
    setFormData({
      ...formData,
      courseId: id,
    });
  };

  return (
    <LoadingErrorHandler loading={isLoading} error={error?.message}>
      <CourseSelector
        courses={courses}
        courseId={courseId}
        setCourseId={setCourseId}
      />
    </LoadingErrorHandler>
  );
};

export default CourseSelectorWrapper;
