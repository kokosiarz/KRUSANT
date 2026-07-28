import DeleteItemDialog from '@/Components/Common/DeleteItemDialog';
import React, { useState } from 'react';
import ClassEditDialog from './Components/ClassEditDialog';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LoadingErrorHandler from '@components/Common/LoadingErrorHandler';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '@api/endpoints/classes';
import { Paper } from '@mui/material';
import type { Class as ClassItem } from '@api/endpoints/classes';
import type { EventDropArg } from '@fullcalendar/core';
import ClassCreationDialog from './Components/ClassCreateDialog';
import FullCalendarWrapper from './Components/FullCallendarWrapper';
import { isInside } from './utils';

const fetchClasses = async (): Promise<ClassItem[]> => {
  return classesApi.getClasses();
};

const Classes: React.FC = () => {

  // State for edit/create dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<string | undefined>(undefined);
  const [editingClassId, setEditingClassId] = useState<number | undefined>(undefined);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // API calls
  const { data: classes = [], isLoading: loading, error, refetch } = useQuery<ClassItem[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  // Delete event API call (with dialog)
  const handleDeleteEvent = async (eventId: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await classesApi.deleteClass(Number(eventId));
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Nie udało się usunąć zajęć');
    } finally {
      setDeleting(false);
    }
  };

  // Delete dialog handlers
  const handleDeleteDialogCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteError(null);
  };
  const handleDeleteDialogConfirm = () => {
    if (deleteTargetId) {
      handleDeleteEvent(deleteTargetId);
    }
  };

  // Persist a drag-to-reschedule: FullCalendar moves the event optimistically
  // in the UI regardless, so if the save fails we revert it and tell the user.
  const handleEventDrop = async (info: EventDropArg) => {
    try {
      await classesApi.updateClass(Number(info.event.id), {
        startTime: info.event.start?.toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    } catch (err) {
      info.revert();
      setRescheduleError(err instanceof Error ? err.message : 'Nie udało się przenieść zajęć');
    }
  };

  const handleDialogClose = () => {
    setEditingClassId(undefined);
    setEditDialogOpen(false);
    setDialogDate(undefined);
    setCreationDialogOpen(false);
  };

  // FullCalendar mouse event handlers
  const handleDateClick = (info: any) => {
    setDialogDate(info.date.toISOString());
    setCreationDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    setEditingClassId(info.event.id);
    setEditDialogOpen(true);
  };

  const onEventDragStop = ({jsEvent, event}:{
    jsEvent: MouseEvent,
    event: any
  }) => {
    if (!isInside(jsEvent, 'callendar-container')) {
      setDeleteTargetId(event.id);
      setDeleteDialogOpen(true);
    }
  }

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Paper sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
        <LoadingErrorHandler loading={loading} error={error ? error.message : null}>
          <Box sx={{ p: 3 }} id='callendar-container'>
            <FullCalendarWrapper
              classes={classes}
              handleDateClick={handleDateClick}
              handleEventClick={handleEventClick}
              onEventDragStop={onEventDragStop}
              onEventDrop={handleEventDrop}
            />
            {/* Keyed by classId so switching classes fully remounts the dialog
                instead of reusing stale local state (e.g. attendance
                selection) from whichever class was open before. */}
            <ClassEditDialog key={editingClassId ?? 'new'} open={editDialogOpen} onClose={handleDialogClose} classId={editingClassId || 0} />
            <ClassCreationDialog open={creationDialogOpen} onClose={handleDialogClose} initialDate={dialogDate} />
            <DeleteItemDialog
              open={deleteDialogOpen}
              itemName={deleteTargetId ? `zajęcia #${deleteTargetId}` : ''}
              deleting={deleting}
              error={deleteError}
              onCancel={handleDeleteDialogCancel}
              onConfirm={handleDeleteDialogConfirm}
            />
          </Box>
        </LoadingErrorHandler>
      </Paper>
      <Snackbar
        open={!!rescheduleError}
        autoHideDuration={6000}
        onClose={() => setRescheduleError(null)}
      >
        <Alert severity="error" onClose={() => setRescheduleError(null)}>
          {rescheduleError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Classes;