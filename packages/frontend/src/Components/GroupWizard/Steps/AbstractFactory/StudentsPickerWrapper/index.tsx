import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import React from 'react';
import StudentsPicker from '../../Components/StudentsPicker';

export const StudentsPickerWrapper: React.FC = () => {
    const { formData, setFormData } = useGroupWizardData();

    // Controlled value: selected student IDs
    const studentIds = formData.studentIds || [];
    const setStudentIds = (ids: number[]) => {
        setFormData({ ...formData, studentIds: ids });
    };

    return (
        <StudentsPicker
            studentIds={studentIds}
            setStudentIds={setStudentIds}
        />
    );
};

export default StudentsPickerWrapper;
