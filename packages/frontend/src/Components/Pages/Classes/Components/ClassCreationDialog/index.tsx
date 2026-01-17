import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useClassDialogData } from './hooks/useClassDialogData';
import { CreateClassRequest, classesApi } from '@/api/endpoints/classes';
import GroupSelector from '@/Components/Common/GroupSelector';
import TeacherSelector from '@/Components/Common/TeacherSelector';
import StudentsSelector from '@/Components/Common/StudentsSelector';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import CircularProgress from '@mui/material/CircularProgress';
import RoomSelector from '@/Components/Common/RoomSelector';
import * as _ from "lodash";
import type { Group } from '@/Components/Pages/Groups/types';
import type { Class as ClassItem } from '@/api/endpoints/classes';
import { renderTimeViewClock } from '@mui/x-date-pickers';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import DurationPicker from '@/Components/Common/DurationPicker';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import PresenceCheckerTab from './PresenceCheckerTab';
import { calculateCost } from './utils';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';

interface ClassCreationDialogProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string; // ISO string date
  classId?: number;
}

export const ClassCreationDialog: React.FC<ClassCreationDialogProps> = ({ open, onClose, initialDate, classId }) => {
  const queryClient = useQueryClient();
  const { teacherList, roomsList, classData: classDataFromDb, groups, refetchClassData, isLoading, error } = useClassDialogData(classId);
  const [saving, setSaving] = useState(false);
  const [formClassData, setFormClassData] = useState<ClassItem>({} as ClassItem);
  const [comment, setComment] = useState<string>('');
  enum ETab {
    Basic = 0,
    Advanced = 1,
    Attendance = 2,
  }
  const [tab, setTab] = useState(classId ? ETab.Attendance : ETab.Basic);

  React.useEffect(() => {
    if (open) {
      if (classId) {
        refetchClassData();
      }
      // Only set state when classDataFromDb is loaded (not undefined)
      if (classId && !classDataFromDb) return;
      setFormClassData(
        classDataFromDb
        || (initialDate && { startTime: initialDate } as ClassItem)
        || {} as ClassItem
      );
      setComment(classDataFromDb?.comment || '');
    }
  }, [open, classDataFromDb, initialDate, classId, refetchClassData]);

  React.useEffect(() => {
    const group: Group | undefined = formClassData.groupId ? groups.find((g: Group) => g.id === formClassData.groupId) : undefined;
    const classDataFromGroup: Partial<ClassItem> = group ? {
      cost: calculateCost(group?.lessonLength, group?.unitCost),
      lessonLength: group?.lessonLength,
      teacherId: group?.teacherId,
      groupId: group?.id,
      roomId: group?.roomId,
    } : {};
    // Only update if dialog is open
    if (open) {
      setFormClassData(prev => {
        // TODO?: could add calculation if duration has changed but the unit cost is known
        return ({
          ..._.omitBy(classDataFromGroup as Partial<ClassItem>, _.isNil),
          ..._.omitBy(classDataFromDb as Partial<ClassItem>, _.isNil),
          ..._.omitBy(prev, _.isNil)
        } as ClassItem)
      });
    }
  }, [groups, classDataFromDb, formClassData.groupId, open]);
  const createMutation = useMutation({
    mutationFn: classesApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setSaving(false);
      purgeFormData();
      onClose();
    },
    onError: () => setSaving(false),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateClassRequest> }) => classesApi.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setSaving(false);
      purgeFormData();
      onClose();
    },
    onError: () => setSaving(false),
  });

  const setAttendanceMutation = useMutation({
    mutationFn: async ({ classId, ids }: { classId: number; ids: number[] }) => {
      await classesApi.setAttendance(classId, ids);
      return { classId };
    },
    onSuccess: ({ classId }: { classId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['getClassById', classId] });
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
    },
  });

  const onFieldChange = (field: keyof ClassItem, value: any) => {
    setFormClassData(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  const handleSave = () => {
    if (!formClassData.startTime || !formClassData.lessonLength || !formClassData.cost) return;
    setSaving(true);
    const data: CreateClassRequest = {
      ...formClassData,
      comment,
    };
    if (classDataFromDb && classDataFromDb.id) {
      updateMutation.mutate({ id: classDataFromDb.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const purgeFormData = () => {
    setFormClassData({} as ClassItem);
    setComment('');
  }

  const handleClose = () => {
    purgeFormData();
    onClose();
  }

  const TeacherSelectorC = <TeacherSelector teacherId={formClassData.teacherId} setTeacherId={value => onFieldChange('teacherId', value)} teacherList={teacherList} compact />;
  const RoomSelectorC = <RoomSelector roomsList={roomsList} roomId={formClassData.roomId} setRoomId={value => onFieldChange('roomId', value)} compact />;
  const StudentsSelectorC = <StudentsSelector studentIds={formClassData.plannedStudentsIds || []} setStudentIds={vals => onFieldChange('plannedStudentsIds', vals)} />;
  const DurationPickerC = <DurationPicker label="Czas zajęć" durationHHmm={formClassData.lessonLength} setDuration={value => onFieldChange('lessonLength', value)} />;
  const presenceCheckerStudentsIds = React.useMemo(() => {
    if (classDataFromDb?.attendedStudentsIds?.length) {
      return classDataFromDb.attendedStudentsIds;
    }
    if (classDataFromDb?.plannedStudentsIds?.length) {
      return classDataFromDb.plannedStudentsIds;
    }
    return [];
  }, [classDataFromDb]);
  const CostC = <FormControl variant="outlined">
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
    /></FormControl>;

  const onAttandanceChecked = (ids: number[]) => {
    if (!classId) return;
    setAttendanceMutation.mutate({ classId, ids });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <LoadingErrorHandler loading={isLoading} error={error?.message} >
        <Box p={1}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} centered sx={{ mb: 2 }}>
            <Tab label="Podstawowe" />
            <Tab label="Zaawansowane" />
            <Tab label="Obecność" />
          </Tabs>

          <DialogContent>
            <Box display={tab === ETab.Basic ? "flex" : "none"} flexDirection="column" gap={2} mt={1}>
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
              <TextField
                label="Komentarz"
                value={comment}
                onChange={e => setComment(e.target.value)}
                fullWidth
                multiline
              />
              {/* Placeholder for additional action buttons */}
              <Box minHeight={32} />
            </Box>

            <Box display={tab === ETab.Advanced ? "flex" : "none"} flexDirection="column" gap={2} mt={1}>
              {TeacherSelectorC}
              {RoomSelectorC}
              {StudentsSelectorC}
              {DurationPickerC}
              {CostC}
            </Box>

            <Box display={tab === ETab.Attendance ? "block" : "none"}>
              {isLoading && tab === ETab.Attendance ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                  <CircularProgress />
                </Box>
              ) : (
                <PresenceCheckerTab
                  studentIds={presenceCheckerStudentsIds}
                  setStudentIds={ids => onAttandanceChecked(ids)}
                  attendedStudentsIds={(classDataFromDb?.attendedStudentsIds) || []}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={saving}>Anuluj</Button>
            <Button onClick={handleSave} disabled={saving || !formClassData.startTime || !formClassData.lessonLength || !formClassData.cost} variant="contained">
              {saving ? <CircularProgress size={20} /> : 'Zapisz'}
            </Button>
          </DialogActions>
        </Box>
      </LoadingErrorHandler>
    </Dialog>
  );
};

export default ClassCreationDialog;
