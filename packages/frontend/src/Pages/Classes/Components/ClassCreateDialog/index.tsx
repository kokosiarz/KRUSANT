
import React, { useState } from 'react';
import {
  Dialog, DialogContent, Button, DialogActions, DialogTitle,
  Box
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { generateOccurrences } from './generateOccurrences';
import CustomDaysDialog from './Components/CustomDaysDialog';
import ConfirmationDialog from './Components/ConfirmationDialog';
import { mapGroupToClassData } from './mapGroupToClassData';
import { classesApi } from '@/api/endpoints/classes';
import { teachersApi } from '@/api/endpoints/teachers';
import { roomsApi } from '@/api/endpoints/rooms';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import 'dayjs/locale/pl';
import BatchClassForm from '../BatchClassForm';
import GroupSelector from './Components/GroupSelector';

interface ClassCreationDialogProps {
  open: boolean;
  initialDate?: string; // ISO string date
  onClose?: () => void;
}


export const ClassCreationDialog: React.FC<ClassCreationDialogProps> = ({ open, onClose, initialDate = new Date().toISOString() }) => {
  const queryClient = useQueryClient();
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

  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDayjs);
  const [selectedHour, setSelectedHour] = useState<Dayjs>(defaultHour);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Sync selectedDate and selectedHour with initialDate and dialog open
  React.useEffect(() => {
    if (open) {
      const newDayjs = initialDate ? dayjs(initialDate) : dayjs();
      setSelectedDate(newDayjs);
      setSelectedHour((newDayjs.hour() === 0 && newDayjs.minute() === 0) ? newDayjs.hour(9).minute(0) : newDayjs);
    }
     
  }, [initialDate, open]);
  const [reocurrance, setReocurrance] = useState('everyday');
  const [customDays, setCustomDays] = useState<number[]>([]); // 0=Sunday, 1=Monday...
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [occurrencesCount, setOccurrencesCount] = useState(10);
  const [occurrences, setOccurrences] = useState<string[]>([]); // ISO strings
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
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
    if (onClose) onClose();
  };

  // Custom days dialog content
  const handleCustomDayToggle = (idx: number) => {
    setCustomDays(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleSave = () => {
    if (!selectedGroup || occurrences.length === 0) return;
    const mapped = occurrences.map(date => mapGroupToClassData(selectedGroup, date, selectedHour.format('HH:mm')));
    setClassesToCreate(mapped);
    setConfirmationOpen(true);
  };

  const handleBatchCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await classesApi.batchCreateClasses(classesToCreate);
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      setConfirmationOpen(false);
      handleClose();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Nie udało się utworzyć zajęć');
    } finally {
      setCreating(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle>Tworzenie zajęć</DialogTitle>
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
          <Button onClick={handleSave} variant="contained" color="primary" disabled={!selectedGroup || occurrences.length === 0}>
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        open={confirmationOpen}
        classesToCreate={classesToCreate}
        roomNamesById={roomNamesById}
        teacherNamesById={teacherNamesById}
        groupName={selectedGroup?.name}
        creating={creating}
        error={createError}
        onConfirm={handleBatchCreate}
        onCancel={() => {
          setConfirmationOpen(false);
          setCreateError(null);
        }}
      />
    </LocalizationProvider>
  );
};

export default ClassCreationDialog;
