import React from 'react';
import { StartHour } from '../../Components';
import { useGroupWizardData } from '../../../Context/GroupWizardDataContext';

const StartHourWrapper: React.FC = () => {
  const { formData, setFormData } = useGroupWizardData();
  console.log('StartHourWrapper formData.startHour', formData.startHour);
  // startHour is now a string (TIME, e.g. '09:00')
  const startHour = typeof formData.startHour === 'string' ? formData.startHour : '09:00';
  const setStartHour = (val: string) => setFormData({ ...formData, startHour: val });
  return <StartHour startHour={startHour} setStartHour={setStartHour} />;
};

export default StartHourWrapper;
