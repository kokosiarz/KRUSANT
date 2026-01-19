
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogActions, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useClassDialogData } from './hooks/useClassDialogData';
import { CreateClassRequest, classesApi } from '@/api/endpoints/classes';
import _ from 'lodash';
import type { Group } from '@/Pages/Groups/types';
import type { Class as ClassItem } from '@/api/endpoints/classes';
import PresenceCheckerTab from './PresenceCheckerTab';
import { calculateCost } from './utils';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';
import { AdvancedTab } from './AdvancedTab';


interface ClassEditDialogProps {
  open: boolean;
  onClose: () => void;
  classId: number;
}


export const ClassEditDialog: React.FC<ClassEditDialogProps> = ({ open, onClose, classId }) => {
  const queryClient = useQueryClient();
  const {
    teacherList,
    roomsList,
    classData: classDataFromDb,
    groups,
    refetchClassData,
    isLoading,
    error,
  } = useClassDialogData(classId);

  const [saving, setSaving] = useState(false);
  const [formClassData, setFormClassData] = useState<ClassItem>({} as ClassItem);
  const [comment, setComment] = useState('');

  enum ETab {
    Attendance = 0,
    Properties = 1,
  }
  const [tab, setTab] = useState(ETab.Attendance);

  useEffect(() => {
    if (!open) return;
    if (classId) refetchClassData();
    if (classId && !classDataFromDb) return;
    setFormClassData(
      classDataFromDb
      || ({} as ClassItem)
    );
    setComment(classDataFromDb?.comment || '');
  }, [open, classDataFromDb, classId, refetchClassData]);

  useEffect(() => {
    const group = formClassData.groupId
      ? groups.find((g: Group) => g.id === formClassData.groupId)
      : undefined;
    const classDataFromGroup: Partial<ClassItem> = group
      ? {
        cost: calculateCost(group.lessonLength, group.unitCost),
        lessonLength: group.lessonLength,
        teacherId: group.teacherId,
        groupId: group.id,
        roomId: group.roomId,
      }
      : {};
    if (open) {
      setFormClassData(prev => ({
        ..._.omitBy(classDataFromGroup, _.isNil),
        ..._.omitBy(classDataFromDb as Partial<ClassItem>, _.isNil),
        ..._.omitBy(prev, _.isNil),
      }) as ClassItem);
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
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateClassRequest> }) =>
      classesApi.updateClass(id, data),
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
  };

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
  };

  const handleClose = () => {
    purgeFormData();
    onClose();
  };

  const presenceCheckerStudentsIds = useMemo(() => {
    if (classDataFromDb?.attendedStudentsIds?.length) {
      return classDataFromDb.attendedStudentsIds;
    }
    if (classDataFromDb?.plannedStudentsIds?.length) {
      return classDataFromDb.plannedStudentsIds;
    }
    return [];
  }, [classDataFromDb]);

  const onAttandanceChecked = (ids: number[]) => {
    if (!classId) return;
    setAttendanceMutation.mutate({ classId, ids });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <LoadingErrorHandler loading={isLoading} error={error?.message}>
        <DialogContent>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            centered
            sx={{ mb: 4 }}
          >
            <Tab icon={<GroupIcon />} iconPosition="start" label="Obecność" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Właściwości" />
          </Tabs>
          <PresenceCheckerTab
            studentIds={presenceCheckerStudentsIds}
            setStudentIds={onAttandanceChecked}
            attendedStudentsIds={classDataFromDb?.attendedStudentsIds || []}
            active={tab === ETab.Attendance}
          />
          <AdvancedTab
            formClassData={formClassData}
            onFieldChange={onFieldChange}
            teacherList={teacherList}
            roomsList={roomsList}
            active={tab === ETab.Properties}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Anuluj
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              saving ||
              !formClassData.startTime ||
              !formClassData.lessonLength ||
              !formClassData.cost
            }
            variant="contained"
          >
            {saving ? <CircularProgress size={20} /> : 'Zapisz'}
          </Button>
        </DialogActions>
      </LoadingErrorHandler>
    </Dialog>
  );
};

export default ClassEditDialog;
