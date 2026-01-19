import React from 'react';
import { Button, Box } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import GenerateOccurrencesDialog from '../ClassCreateDialog/Components/GenerateOccurrencesDialog';
import OccurrenceList from '../ClassCreateDialog/Components/OccurrenceList';

interface ReocurranceOptions {
  value: string;
  label: string;
}

interface BatchClassFormProps {
  selectedDate: any;
  setSelectedDate: (v: any) => void;
  selectedHour: any;
  setSelectedHour: (v: any) => void;
  reocurrance: string;
  setReocurrance: (v: string) => void;
  reocurranceOptions: ReocurranceOptions[];
  skipHolidays: boolean;
  setSkipHolidays: (v: boolean) => void;
  occurrencesCount: number;
  setOccurrencesCount: (v: number) => void;
  occurrences: string[];
  setOccurrences: (v: string[]) => void;
  handleGenerateOccurrences: () => void;
  handleOccurrenceDelete: (idx: number) => void;
  setCustomDialogOpen: (v: boolean) => void;
}

const BatchClassForm: React.FC<BatchClassFormProps> = ({
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  reocurrance,
  setReocurrance,
  reocurranceOptions,
  skipHolidays,
  setSkipHolidays,
  occurrencesCount,
  setOccurrencesCount,
  occurrences,
  setOccurrences,
  handleGenerateOccurrences,
  handleOccurrenceDelete,
  setCustomDialogOpen,
}) => {
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const handleGenerateAndClose = () => {
    handleGenerateOccurrences();
    setGenerateDialogOpen(false);
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 2, gap: 2 }}>
      <TimePicker
        label="Godzina zajęć"
        value={selectedHour}
        onChange={v => v && setSelectedHour(v)}
        ampm={false}
        format="HH:mm"
        slotProps={{ textField: { fullWidth: true } }}
      />
      {/* Recurrence selector moved to dialog */}
      {reocurrance !== 'none' && (
        <>
          <Button variant="contained" onClick={() => setGenerateDialogOpen(true)}>
            Generuj terminy
          </Button>
          <GenerateOccurrencesDialog
            open={generateDialogOpen}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            reocurrance={reocurrance}
            setReocurrance={setReocurrance}
            reocurranceOptions={reocurranceOptions}
            setCustomDialogOpen={setCustomDialogOpen}
            skipHolidays={skipHolidays}
            setSkipHolidays={setSkipHolidays}
            occurrencesCount={occurrencesCount}
            setOccurrencesCount={setOccurrencesCount}
            onGenerate={handleGenerateAndClose}
            onClose={() => setGenerateDialogOpen(false)}
          />
        </>
      )}
      <OccurrenceList
        occurrences={occurrences}
        onEdit={(idx, newDate) => {
          const updated = [...occurrences];
          updated[idx] = newDate;
          setOccurrences(updated);
        }}
        onDelete={handleOccurrenceDelete}
      />
      <Button variant="outlined" color="secondary" onClick={() => setOccurrences([])} sx={{ mt: 1 }}>
        Wyczyść listę
      </Button>
    </Box>
  );
};

export default BatchClassForm;
