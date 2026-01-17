import StudentsSelector from "@/Components/Common/StudentsSelector";
import { Box } from "@mui/material";
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from "react";
import _ from "lodash";

export const PresenceCheckerTab: React.FC<{ studentIds: number[]; setStudentIds: (ids: number[]) => void; attendedStudentsIds: number[] }> = ({ studentIds, setStudentIds, attendedStudentsIds }) => {

    const [studentsToApprove, setStudentsToApprove] = useState<number[]>(studentIds);
    const approve = () => {
        setStudentIds(studentsToApprove);
    }
    const StudentsSelectorC = <StudentsSelector 
        studentIds={studentsToApprove || []}
        setStudentIds={setStudentsToApprove}
    />;
    const approved = _.isEqual(_.sortBy(studentsToApprove), _.sortBy(attendedStudentsIds));

    console.log({ studentsToApprove, attendedStudentsIds, approved });

    return (
        <Box>
            {StudentsSelectorC}
            {!approved ?
                <Button size="large" variant="contained" color="primary" sx={{ mt: 2 }} onClick={approve}>
                    Potwierdź obecność
                </Button>
                :
                <Button size="large" variant="outlined" color="success" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                    Obecność potwierdzona
                </Button>
            }
        </Box>
    )
};

export default PresenceCheckerTab;