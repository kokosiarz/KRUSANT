import DeleteItemDialog from '@/Components/Common/DeleteItemDialog';
import React, { useState } from 'react';
import ClassEditDialog from './Components/ClassEditDialog';
import Box from '@mui/material/Box';
import LoadingErrorHandler from '@components/Common/LoadingErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { classesApi } from '@api/endpoints/classes';
import { Paper } from '@mui/material';
import type { Class as ClassItem } from '@api/endpoints/classes';
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


  // API calls
  const { data: classes = [], isLoading: loading, error, refetch } = useQuery<ClassItem[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  // Delete event API call (with dialog)
  const handleDeleteEvent = async (eventId: string) => {
    setDeleting(true);
    try {
      await classesApi.deleteClass(Number(eventId));
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      refetch();
    } finally {
      setDeleting(false);
    }
  };

  // Delete dialog handlers
  const handleDeleteDialogCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };
  const handleDeleteDialogConfirm = () => {
    if (deleteTargetId) {
      handleDeleteEvent(deleteTargetId);
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
            />
            <ClassEditDialog open={editDialogOpen} onClose={handleDialogClose} classId={editingClassId || 0} />
            <ClassCreationDialog open={creationDialogOpen} onClose={handleDialogClose} initialDate={dialogDate} />
            <DeleteItemDialog
              open={deleteDialogOpen}
              itemName={deleteTargetId ? `zajęcia #${deleteTargetId}` : ''}
              deleting={deleting}
              onCancel={handleDeleteDialogCancel}
              onConfirm={handleDeleteDialogConfirm}
            />
          </Box>
        </LoadingErrorHandler>
      </Paper>
    </Box>
  );
};

export default Classes;