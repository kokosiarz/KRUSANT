
import React, { useState } from 'react';
import { Box } from '@mui/material';
import StudentsSelector from '@/Components/Common/StudentsSelector';
import ApprovalConfirmedButton from './ApprovalConfirmedButton';
import ApproveButton from './ApproveButton';
import _ from 'lodash';


interface PresenceCheckerTabProps {
    studentIds: number[];
    setStudentIds: (ids: number[]) => void;
    attendedStudentsIds: number[];
    active: boolean;
}


export const PresenceCheckerTab: React.FC<PresenceCheckerTabProps> = ({
    studentIds,
    setStudentIds,
    attendedStudentsIds,
    active,
}) => {
    const [studentsToApprove, setStudentsToApprove] = useState<number[]>(studentIds);

    const approve = () => setStudentIds(studentsToApprove);

    const isApproved = _.isEqual(
        _.sortBy(studentsToApprove),
        _.sortBy(attendedStudentsIds)
    );

    return (
        <Box display={active ? 'block' : 'none'}>
            <StudentsSelector
                studentIds={studentsToApprove || []}
                setStudentIds={setStudentsToApprove}
            />
            {isApproved ? (
                <ApprovalConfirmedButton />
            ) : (
                <ApproveButton onClick={approve} />
            )}
        </Box>
    );
};

export default PresenceCheckerTab;