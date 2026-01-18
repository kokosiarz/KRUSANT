import type { Class } from '@/api/endpoints/classes';
import { Teacher } from '@/api/endpoints/teachers';
import { Room } from '@/api/types/room';
import DurationPicker from '@/Components/Common/DurationPicker';
import GroupSelector from '@/Components/Common/GroupSelector';
import RoomSelector from '@/Components/Common/RoomSelector';
import StudentsSelector from '@/Components/Common/StudentsSelector';
import TeacherSelector from '@/Components/Common/TeacherSelector';
import { InputLabel, OutlinedInput, InputAdornment, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import { DateTimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface AdvancedTabProps {
    formClassData: Partial<Class>;
    onFieldChange: (field: keyof Class, value: any) => void;
    teacherList: Array<Teacher>;
    roomsList: Array<Room>;
    active?: boolean;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ formClassData, onFieldChange, teacherList, roomsList, active }) => < Box
    display={active ? "flex" : "none"}
    flexDirection="column"
    gap={2}
    mt={1} >
    <GroupSelector value={formClassData.groupId} onChange={value => onFieldChange('groupId', value)} />
    <DateTimePicker
        label="Data i godzina"
        value={dayjs(formClassData.startTime)}
        onChange={value => onFieldChange('startTime', value)}
        format="DD-MM-YYYY HH:mm"
        viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
            seconds: renderTimeViewClock,
        }}
        ampm={false}
        slotProps={{ textField: { fullWidth: true } }}
    />
    <TeacherSelector
        teacherId={formClassData.teacherId}
        setTeacherId={value => onFieldChange('teacherId', value)}
        teacherList={teacherList} compact
    />
    <RoomSelector
        roomsList={roomsList}
        roomId={formClassData.roomId}
        setRoomId={value => onFieldChange('roomId', value)}
        compact
    />
    <StudentsSelector
        studentIds={formClassData.plannedStudentsIds || []}
        setStudentIds={vals => onFieldChange('plannedStudentsIds', vals)} />
    <DurationPicker
        label="Czas zajęć" durationHHmm={formClassData.lessonLength || '05:00'}
        setDuration={value => onFieldChange('lessonLength', value)}
    />
    <FormControl variant="outlined">
        <InputLabel htmlFor='display-name'>Koszt</InputLabel>
        <OutlinedInput
            inputProps={{
                min: 0,
                step: 50,
                "aria-label": "Koszt",
            }}
            label="Koszt"
            placeholder="Koszt"
            type="number"
            value={formClassData?.cost}
            onChange={e => onFieldChange('cost', e.target.value === '' ? 0 : Number(e.target.value))}
            endAdornment={<InputAdornment position="end">PLN</InputAdornment>}
            fullWidth
            required
        /></FormControl>
    <TextField
        label="Komentarz"
        value={formClassData.comment}
        onChange={e => onFieldChange('comment', e.target.value)}
        fullWidth
        multiline
    />
</Box >

export default AdvancedTab;