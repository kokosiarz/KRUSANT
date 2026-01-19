import React, { useState } from 'react';
import ClassEditDialog from './Components/ClassEditDialog';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Box from '@mui/material/Box';
import LoadingErrorHandler from '../../Components/Common/LoadingErrorHandler';

import { useQuery } from '@tanstack/react-query';
import { classesApi } from '../../api/endpoints/classes';
import { Paper } from '@mui/material';
import { StyledCalendarWrapper } from './styles';
import { useClassEventsWithNames } from './hooks/useClassEventsWithNames';
import plLocale from '@fullcalendar/core/locales/pl';


import type { Class as ClassItem } from '../../api/endpoints/classes';
import ClassCreationDialog from './Components/ClassCreateDialog';

const fetchClasses = async (): Promise<ClassItem[]> => {
  return classesApi.getClasses();
};

const Classes: React.FC = () => {
  const { data: classes = [], isLoading: loading, error } = useQuery<ClassItem[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  const events = useClassEventsWithNames(classes);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<string | undefined>(undefined);
  const [editingClassId, setEditingClassId] = useState<number | undefined>(undefined);

  const handleDateClick = (info: any) => {
    setDialogDate(info.date.toISOString());
    setCreationDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingClassId(undefined);
    setEditDialogOpen(false);
    setDialogDate(undefined);
    setCreationDialogOpen(false);
  };

  const handleEventClick = (info: any) => {
    setEditingClassId(info.event.id);
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Paper sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
        <LoadingErrorHandler loading={loading} error={error ? error.message : null}>
          <Box sx={{ p: 3 }}>
            <StyledCalendarWrapper>
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                weekends={true}
                events={events}
                allDaySlot={false}
                height="auto"
                slotMinTime="09:00:00"
                slotMaxTime="22:00:00"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek',
                }}
                editable={true}
                locale={plLocale}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                nowIndicator={true}
              />
            </StyledCalendarWrapper>
            <ClassEditDialog open={editDialogOpen} onClose={handleDialogClose} classId={editingClassId || 0} />
            <ClassCreationDialog open={creationDialogOpen} onClose={handleDialogClose} initialDate={dialogDate} />
          </Box>
        </LoadingErrorHandler>
      </Paper>
    </Box>
  );
};

export default Classes;