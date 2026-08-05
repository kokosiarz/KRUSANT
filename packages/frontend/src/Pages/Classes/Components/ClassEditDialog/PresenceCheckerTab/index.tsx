import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '@api/endpoints/students';
import ApprovalConfirmedButton from './ApprovalConfirmedButton';
import ApproveButton from './ApproveButton';
import _ from 'lodash';
import type { AttendanceEntry, AttendanceStatus } from '@/api/endpoints/classes';

interface PresenceCheckerTabProps {
    /**
     * Who to show a toggle for — the class's planned roster plus anyone
     * already marked. Editing the roster itself happens on the Właściwości
     * tab; this tab only decides each student's status, so there is
     * deliberately no student picker here.
     */
    studentIds: number[];
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

export const PresenceCheckerTab: React.FC<PresenceCheckerTabProps> = ({
    studentIds,
    savedEntries,
    onSave,
    active,
}) => {
    // Only the statuses the user has actually touched. Everything else falls
    // back to what's saved, then to "present" — so a roster change made on the
    // other tab shows up here immediately without any state to keep in sync.
    const [overrides, setOverrides] = useState<Record<number, AttendanceStatus>>({});
    const { data: allStudents = [] } = useQuery({
        queryKey: ['students'],
        queryFn: studentsApi.getStudents,
    });

    const studentById = useMemo(
        () => new Map(allStudents.map((s) => [s.id, s])),
        [allStudents]
    );
    const savedByStudent = useMemo(
        () => Object.fromEntries(savedEntries.map((e) => [e.studentId, e.status])) as Record<number, AttendanceStatus>,
        [savedEntries]
    );

    const statusFor = (studentId: number): AttendanceStatus =>
        overrides[studentId] ?? savedByStudent[studentId] ?? 'present';

    const currentEntries: AttendanceEntry[] = studentIds.map((studentId) => ({
        studentId,
        status: statusFor(studentId),
    }));

    const isApproved = _.isEqual(
        _.sortBy(currentEntries, 'studentId'),
        _.sortBy(savedEntries, 'studentId')
    );

    return (
        <Box sx={{ display: active ? 'block' : 'none' }}>
            {studentIds.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Brak kursantów na liście. Dodaj ich w zakładce „Właściwości”.
                </Typography>
            ) : (
                <Stack spacing={1.5}>
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
                                value={statusFor(studentId)}
                                onChange={(_e, value: AttendanceStatus | null) =>
                                    value && setOverrides((prev) => ({ ...prev, [studentId]: value }))
                                }
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
            {studentIds.length > 0 &&
                (isApproved ? (
                    <ApprovalConfirmedButton />
                ) : (
                    <ApproveButton onClick={() => onSave(currentEntries)} />
                ))}
        </Box>
    );
};

export default PresenceCheckerTab;
