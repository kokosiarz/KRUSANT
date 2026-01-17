
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/api/endpoints/courses';
import { roomsApi } from '@/api/endpoints/rooms';
import { teachersApi } from '@/api/endpoints/teachers';
import { useGroupWizardData } from '../../../Context/GroupWizardDataContext';
import Summary from '../../Components/Summary';


import { useContext } from 'react';
import { GroupWizardContext } from '../../../Context/GroupWizardContext';

const SummaryWrapper: React.FC = () => {
    const { formData } = useGroupWizardData();
    const context = useContext(GroupWizardContext);

    const { data: courses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: coursesApi.getCourses,
    });
    const { data: rooms = [] } = useQuery({
        queryKey: ['rooms'],
        queryFn: roomsApi.getRooms,
    });
    const { data: teachers = [] } = useQuery({
        queryKey: ['teachers'],
        queryFn: teachersApi.getTeachers,
    });

    // Handler to jump to the step by step key
    const handleEditStep = (stepKey: string) => {
        if (!context) return;
        const { setCurrentStepNo, stepsList } = context;
        if (!stepsList || !setCurrentStepNo) return;
        const idx = stepsList.findIndex((s: any) => s.step === stepKey);
        if (idx !== -1) setCurrentStepNo(idx);
    };

    return <Summary formData={formData} courses={courses} rooms={rooms} teachers={teachers} onEditStep={handleEditStep} />;
};

export default SummaryWrapper;
