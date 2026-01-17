import React from 'react';
import { DurationSlider } from '../../Components';
import { useGroupWizardData } from '../../../Context/GroupWizardDataContext';

const LessonLengthWrapper: React.FC = () => {
  const { formData, setFormData } = useGroupWizardData();
  // lessonLength is now a string (TIME, e.g. '01:30')
  const lessonLength = typeof formData.lessonLength === 'string' ? formData.lessonLength : '01:00';
  const setLessonLength = (val: string) => setFormData({ ...formData, lessonLength: val });
  return <DurationSlider lessonLength={lessonLength} setLessonLength={setLessonLength} />;
};

export default LessonLengthWrapper;
