import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useQuery } from '@tanstack/react-query';
import StudentsSelector from '@/Components/Common/StudentsSelector';
import { studentsApi } from '@api/endpoints/students';
import ApprovalConfirmedButton from './ApprovalConfirmedButton';
import ApproveButton from './ApproveButton';
import _ from 'lodash';
import type { AttendanceEntry, AttendanceStatus } from '@/api/endpoints/classes';

interface PresenceCheckerTabProps {
    /** Seeds the draft: saved attendance if any exists, else the planned roster (all defaulted to "present"). */
    initialEntries: AttendanceEntry[];
    /** What's actually persisted — compared against the draft to show Approve vs. Confirmed. */
    savedEntries: AttendanceEntry[];
    onSave: (entries: AttendanceEntry[]) => void;
    active: boolean;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: 'success' | 'error' | 'warning' }[] = [
    { value: 'present', label: 'Obecny', color: 'success' },
    { value: 'absent', label: 'Nieobecny', color: 'error' },
    { value: 'rescheduled', label: 'Przełożone', color: 'warning' },
];

const entriesToMap = (entries: AttendanceEntry[]): Record<number, AttendanceStatus> =>
    Object.fromEntries(entries.map((e) => [e.studentId, e.status]));

export const PresenceCheckerTab: React.FC<PresenceCheckerTabProps> = ({
    initialEntries,
    savedEntries,
    onSave,
    active,
}) => {
    const [statusByStudent, setStatusByStudent] = useState<Record<number, AttendanceStatus>>(
        () => entriesToMap(initialEntries)
    );
    const { data: allStudents = [] } = useQuery({
        queryKey: ['students'],
        queryFn: studentsApi.getStudents,
    });
    const studentById = new Map(allStudents.map((s) => [s.id, s]));

    const studentIds = Object.keys(statusByStudent).map(Number);

    // Adding a student defaults them to "present" (matching the old
    // select-to-mark-attended behaviour); removing them clears their status
    // entirely, back to unmarked.
    const setStudentIds = (ids: number[]) => {
        setStatusByStudent((prev) => {
            const next: Record<number, AttendanceStatus> = {};
            for (const id of ids) next[id] = prev[id] ?? 'present';
            return next;
        });
    };

    const setStatus = (studentId: number, status: AttendanceStatus) => {
        setStatusByStudent((prev) => ({ ...prev, [studentId]: status }));
    };

    const currentEntries: AttendanceEntry[] = studentIds.map((studentId) => ({
        studentId,
        status: statusByStudent[studentId],
    }));

    const isApproved = _.isEqual(
        _.sortBy(currentEntries, 'studentId'),
        _.sortBy(savedEntries, 'studentId')
    );

    return (
        <Box sx={{ display: active ? 'block' : 'none' }}>
            <StudentsSelector
                studentIds={studentIds}
                setStudentIds={setStudentIds}
            />
            {studentIds.length > 0 && (
                <Stack spacing={1.5} sx={{ mt: 2.5 }}>
                    {studentIds.map((studentId) => (
                        <Stack
                            key={studentId}
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1 }}
                        >
                            <Typography variant="body2" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {studentById.get(studentId)?.name || `Kursant ${studentId}`}
                            </Typography>
                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                value={statusByStudent[studentId]}
                                onChange={(_e, value: AttendanceStatus | null) => value && setStatus(studentId, value)}
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <ToggleButton key={opt.value} value={opt.value} color={opt.color}>
                                        {opt.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Stack>
                    ))}
                </Stack>
            )}
            {isApproved ? (
                <ApprovalConfirmedButton />
            ) : (
                <ApproveButton onClick={() => onSave(currentEntries)} />
            )}
        </Box>
    );
};

export default PresenceCheckerTab;
