
import React, { useState } from 'react';
import {
  Dialog, DialogContent, Button, DialogActions, DialogTitle
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { useQueryClient } from '@tanstack/react-query';
// import type { Class as ClassItem } from '@/api/endpoints/classes';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';
import dayjs, { Dayjs } from 'dayjs';
import { generateOccurrences } from './generateOccurrences';
import CustomDaysDialog from './CustomDaysDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { mapGroupToClassData } from './mapGroupToClassData';
import { classesApi } from '@/api/endpoints/classes';
import { useQueryClient } from '@tanstack/react-query';
import 'dayjs/locale/pl';
import BatchClassForm from './BatchClassForm';
import GroupSelector from './GroupSelector';

interface ClassCreationDialogProps {
  open: boolean;
  initialDate?: string; // ISO string date
  onClose?: () => void;
}


export const ClassCreationDialog: React.FC<ClassCreationDialogProps> = ({ open, onClose, initialDate = new Date().toISOString() }) => {
  const isLoading = false;
  const queryClient = useQueryClient();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate, open]);
  const [reocurrance, setReocurrance] = useState('everyday');
  const [customDays, setCustomDays] = useState<number[]>([]); // 0=Sunday, 1=Monday...
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [occurrencesCount, setOccurrencesCount] = useState(10);
  const [occurrences, setOccurrences] = useState<string[]>([]); // ISO strings
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [classesToCreate, setClassesToCreate] = useState<any[]>([]);
  // const queryClient = useQueryClient();
  // const saving = false; // Placeholder for saving state
  // const error = undefined;

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
    try {
      await classesApi.batchCreateClasses(classesToCreate);
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
    } catch (e) {
      // Optionally handle error (show notification, etc.)
    }
    setConfirmationOpen(false);
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle>Tworzenie zajęć</DialogTitle>
        <LoadingErrorHandler loading={isLoading} >
          <DialogContent>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Anuluj</Button>
            <Button onClick={handleSave} variant="contained" color="primary" disabled={!selectedGroup || occurrences.length === 0}>
              Zapisz
            </Button>
          </DialogActions>
        </LoadingErrorHandler>
      </Dialog>
      <ConfirmationDialog
        open={confirmationOpen}
        classesToCreate={classesToCreate}
        onConfirm={handleBatchCreate}
        onCancel={() => setConfirmationOpen(false)}
      />
    </LocalizationProvider>
  );
};

export default ClassCreationDialog;
