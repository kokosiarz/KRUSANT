import React, { useState } from 'react';
import {
  Dialog, DialogContent, Button, DialogActions, DialogTitle,
  Box, List, ListItem, ListItemText, Typography, Alert, CircularProgress
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { generateOccurrences } from './generateOccurrences';
import CustomDaysDialog from './Components/CustomDaysDialog';
import { mapGroupToClassData } from './mapGroupToClassData';
import { classesApi } from '@/api/endpoints/classes';
import { teachersApi } from '@/api/endpoints/teachers';
import { roomsApi } from '@/api/endpoints/rooms';
import { groupsApi } from '@/api/endpoints/groups';
import type { Group } from '@/Pages/Groups/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import 'dayjs/locale/pl';
import BatchClassForm from '../BatchClassForm';
import GroupSelector from './Components/GroupSelector';

interface ClassCreationDialogProps {
  open: boolean;
  initialDate?: string; // ISO string date
  onClose?: () => void;
  /**
   * Pre-selects the group. Set when this is opened straight after creating one,
   * so the user isn't asked to pick the group they just made.
   */
  initialGroupId?: number;
}

type Step = 'form' | 'confirm';

export const ClassCreationDialog: React.FC<ClassCreationDialogProps> = ({ open, onClose, initialDate = new Date().toISOString(), initialGroupId }) => {
  const queryClient = useQueryClient();
  const { data: allGroups = [] } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
    enabled: open && initialGroupId !== undefined,
  });
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: teachersApi.getTeachers });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: roomsApi.getRooms });
  const teacherNamesById: Record<number, string> = Object.fromEntries(
    teachers.map((t) => [t.id, t.name ?? `Nauczyciel #${t.id}`]),
  );
  const roomNamesById: Record<number, string> = Object.fromEntries(rooms.map((r) => [r.id, r.name]));

  // Reocurrence options
  const reocurranceOptions = [
    { value: 'none', label: 'Brak' },
    { value: 'onceAWeek', label: 'Raz w tygodniu' },
    { value: 'workdays', label: 'Dni robocze' },
    { value: 'weekends', label: 'Weekend' },
    { value: 'everyday', label: 'Codziennie' },
    { value: 'custom', label: 'Wybierz dni tygodnia...' },
  ];

  // Parse initial date and hour
  const initialDayjs = initialDate ? dayjs(initialDate) : dayjs();
  const defaultHour = (initialDayjs.hour() === 0 && initialDayjs.minute() === 0) ? initialDayjs.hour(9).minute(0) : initialDayjs;

  const [step, setStep] = useState<Step>('form');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDayjs);
  const [selectedHour, setSelectedHour] = useState<Dayjs>(defaultHour);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Sync selectedDate and selectedHour with initialDate and dialog open
  React.useEffect(() => {
    if (open) {
      const newDayjs = initialDate ? dayjs(initialDate) : dayjs();
      setSelectedDate(newDayjs);
      setSelectedHour((newDayjs.hour() === 0 && newDayjs.minute() === 0) ? newDayjs.hour(9).minute(0) : newDayjs);
      setStep('form');
    }
  }, [initialDate, open]);

  // Apply the pre-selected group once the list has loaded. The selector holds
  // the whole group object (mapGroupToClassData reads its cost/room/teacher),
  // so an id alone isn't enough.
  React.useEffect(() => {
    if (!open || initialGroupId === undefined) return;
    const match = allGroups.find((g) => g.id === initialGroupId);
    if (match) setSelectedGroup(match);
  }, [open, initialGroupId, allGroups]);
  const [reocurrance, setReocurrance] = useState('everyday');
  const [customDays, setCustomDays] = useState<number[]>([]); // 0=Sunday, 1=Monday...
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [occurrencesCount, setOccurrencesCount] = useState(10);
  const [occurrences, setOccurrences] = useState<string[]>([]); // ISO strings
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [classesToCreate, setClassesToCreate] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Weekday names in Polish
  const weekDays = [
    'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'
  ];

  // Use imported generateOccurrences function
  const handleGenerateOccurrences = () => {
    const occ = generateOccurrences(
      selectedDate,
      selectedHour,
      reocurrance as any,
      customDays,
      occurrencesCount,
      skipHolidays
    );
    setOccurrences(occ);
  };

  // Clear state on close
  const handleClose = () => {
    setReocurrance('everyday');
    setCustomDays([]);
    setSkipHolidays(true);
    setOccurrencesCount(10);
    setOccurrences([]);
    setCustomDialogOpen(false);
    setStep('form');
    setCreateError(null);
    if (onClose) onClose();
  };

  // Custom days dialog content
  const handleCustomDayToggle = (idx: number) => {
    setCustomDays(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleProceedToConfirm = () => {
    if (!selectedGroup || occurrences.length === 0) return;
    const mapped = occurrences.map(date => mapGroupToClassData(selectedGroup, date, selectedHour.format('HH:mm')));
    setClassesToCreate(mapped);
    setStep('confirm');
  };

  const handleBatchCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await classesApi.batchCreateClasses(classesToCreate);
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      handleClose();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Nie udało się utworzyć zajęć');
    } finally {
      setCreating(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <Dialog open={open} maxWidth="sm" fullWidth onClose={creating ? undefined : handleClose}>
        <DialogTitle>{step === 'form' ? 'Tworzenie zajęć' : 'Potwierdź utworzenie zajęć'}</DialogTitle>
        {step === 'form' ? (
          <>
            <DialogContent>
              <Box sx={{ mt: 1 }}>
                <GroupSelector value={selectedGroup} onChange={setSelectedGroup} />
                <BatchClassForm
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedHour={selectedHour}
                  setSelectedHour={setSelectedHour}
                  reocurrance={reocurrance}
                  setReocurrance={setReocurrance}
                  reocurranceOptions={reocurranceOptions}
                  skipHolidays={skipHolidays}
                  setSkipHolidays={setSkipHolidays}
                  occurrencesCount={occurrencesCount}
                  setOccurrencesCount={setOccurrencesCount}
                  occurrences={occurrences}
                  setOccurrences={setOccurrences}
                  handleGenerateOccurrences={handleGenerateOccurrences}
                  handleOccurrenceDelete={idx => setOccurrences(occurrences.filter((_, i) => i !== idx))}
                  setCustomDialogOpen={setCustomDialogOpen}
                />
                {/* Custom days dialog */}
                <CustomDaysDialog
                  open={customDialogOpen}
                  weekDays={weekDays}
                  customDays={customDays}
                  onToggle={handleCustomDayToggle}
                  onClose={() => setCustomDialogOpen(false)}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Anuluj</Button>
              <Button
                onClick={handleProceedToConfirm}
                variant="contained"
                color="primary"
                disabled={!selectedGroup || occurrences.length === 0}
              >
                Dalej
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Zostanie utworzonych {classesToCreate.length} zajęć{selectedGroup?.name ? ` dla grupy „${selectedGroup.name}”` : ''}:
              </Typography>
              <List>
                {classesToCreate.map((cls, idx) => (
                  <ListItem key={idx} divider>
                    <ListItemText
                      primary={`Data: ${cls.startTime || ''}, Sala: ${(cls.roomId && roomNamesById[cls.roomId]) || 'brak'}, Nauczyciel: ${(cls.teacherId && teacherNamesById[cls.teacherId]) || 'brak'}`}
                      secondary={`Długość: ${cls.lessonLength || ''}, Koszt: ${cls.cost ?? ''}`}
                    />
                  </ListItem>
                ))}
              </List>
              {createError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {createError}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStep('form')} disabled={creating}>Wstecz</Button>
              <Button onClick={handleClose} disabled={creating}>Anuluj</Button>
              <Button onClick={handleBatchCreate} variant="contained" color="primary" disabled={creating}>
                {creating ? <CircularProgress size={20} /> : 'Zatwierdź'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </LocalizationProvider>
  );
};

export default ClassCreationDialog;
