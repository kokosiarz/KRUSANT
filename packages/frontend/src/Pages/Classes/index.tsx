import DeleteItemDialog from '@/Components/Common/DeleteItemDialog';
import React, { useState } from 'react';
import ClassEditDialog from './Components/ClassEditDialog';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
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
  const [dragging, setDragging] = useState(false);
  const [overDropZone, setOverDropZone] = useState(false);

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

  // The desktop week/month grid opens creation via dateClick on an empty cell,
  // but the mobile agenda view has no empty cells — only rows for classes that
  // already exist — so there was no way to start one on a phone. This opens
  // the same dialog with no date pre-filled; ClassCreationDialog defaults that
  // to today.
  const handleFabAdd = () => {
    setDialogDate(undefined);
    setCreationDialogOpen(true);
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
    setDragging(false);
    setOverDropZone(false);
    if (!isInside(jsEvent, 'callendar-container')) {
      setDeleteTargetId(event.id);
      setDeleteDialogOpen(true);
    }
  }

  // Drag-out-to-delete had no feedback at all: nothing told you it was possible,
  // and nothing confirmed you had dragged far enough. While a drag is in
  // progress we show a hint bar that lights up once the pointer leaves the
  // calendar, so the gesture is visible and its threshold is obvious.
  const onEventDragStart = () => setDragging(true);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) =>
      setOverDropZone(!isInside(e, 'callendar-container'));
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [dragging]);

  const deleteTargetLabel = React.useMemo(() => {
    const target = classes.find((c) => String(c.id) === String(deleteTargetId));
    if (!target) return deleteTargetId ? `zajęcia #${deleteTargetId}` : '';
    const when = target.startTime
      ? new Intl.DateTimeFormat('pl-PL', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(target.startTime))
      : '';
    // "zajęcia #123" told the user nothing about what they were about to lose.
    return `zajęcia ${when}`.trim();
  }, [classes, deleteTargetId]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, width: '100%' }}>
      {/* The height cap keeps the desktop week grid (22 hourly rows) inside
          the viewport instead of pushing the footer off-screen. On mobile the
          view is an agenda list with `height="auto"` — capping it there just
          adds a second scrollbar in a page with room to spare. */}
      <Paper
        sx={{
          maxHeight: { xs: 'none', md: 'calc(100vh - 200px)' },
          overflow: { xs: 'visible', md: 'auto' },
        }}
      >
        <LoadingErrorHandler loading={loading} error={error ? error.message : null}>
          <Box sx={{ p: { xs: 1.5, sm: 3 } }} id='callendar-container'>
            <FullCalendarWrapper
              classes={classes}
              handleDateClick={handleDateClick}
              handleEventClick={handleEventClick}
              onEventDragStart={onEventDragStart}
              onEventDragStop={onEventDragStop}
              onEventDrop={handleEventDrop}
            />
            {/* Keyed by classId so switching classes fully remounts the dialog
                instead of reusing stale local state (e.g. attendance
                selection) from whichever class was open before. */}
            <ClassEditDialog
              key={editingClassId ?? 'new'}
              open={editDialogOpen}
              onClose={handleDialogClose}
              classId={editingClassId || 0}
              onRequestDelete={(id) => {
                setEditDialogOpen(false);
                setDeleteTargetId(String(id));
                setDeleteError(null);
                setDeleteDialogOpen(true);
              }}
            />
            <ClassCreationDialog open={creationDialogOpen} onClose={handleDialogClose} initialDate={dialogDate} />
            <DeleteItemDialog
              open={deleteDialogOpen}
              itemName={deleteTargetLabel}
              deleting={deleting}
              error={deleteError}
              onCancel={handleDeleteDialogCancel}
              onConfirm={handleDeleteDialogConfirm}
            />
          </Box>
        </LoadingErrorHandler>
      </Paper>

      {/* Desktop creates a class by clicking an empty grid cell, which the
          mobile agenda view has no equivalent of — this is that entry point,
          shown only where the click affordance doesn't exist. */}
      <Fab
        color="primary"
        aria-label="Dodaj zajęcia"
        onClick={handleFabAdd}
        sx={{
          display: { xs: 'flex', md: 'flex' },
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: (t) => t.zIndex.speedDial,
        }}
      >
        <AddIcon />
      </Fab>

      {dragging && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (t) => t.zIndex.modal - 1,
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              py: 1.25,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 2,
              borderStyle: 'dashed',
              transition: 'background-color .15s ease, border-color .15s ease',
              ...(overDropZone
                ? {
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    borderColor: 'error.dark',
                    borderStyle: 'solid',
                  }
                : {
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    borderColor: 'divider',
                  }),
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
            {overDropZone
              ? 'Upuść, aby usunąć zajęcia'
              : 'Przeciągnij poza kalendarz, aby usunąć'}
          </Box>
        </Box>
      )}

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