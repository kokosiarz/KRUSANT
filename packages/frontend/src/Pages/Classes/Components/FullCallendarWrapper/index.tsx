import React, { useRef } from 'react';
import { StyledCalendarWrapper } from './styles';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin, { DateClickArg, EventDragStopArg } from '@fullcalendar/interaction'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useClassEventsWithNames } from './hooks/useClassEventsWithNames';
import plLocale from '@fullcalendar/core/locales/pl';
import { Class } from '@/api/endpoints/classes';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import EventContent from './EventContent';
import SwipeableCalendar from './SwipeableCalendar';

interface FullCalendarWrapperProps {
    classes: Class[];
    handleEventClick?: (arg: EventClickArg) => void;
    handleDateClick?: (arg: DateClickArg) => void;
    onEventDragStart?: () => void;
    onEventDragStop?: (arg: EventDragStopArg) => void;
    onEventDrop?: (arg: EventDropArg) => void;
}

export const FullCalendarWrapper: React.FC<FullCalendarWrapperProps> = ({
    classes,
    handleEventClick,
    handleDateClick,
    onEventDragStart,
    onEventDragStop,
    onEventDrop,
}) => {
    const events = useClassEventsWithNames(classes);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const calendarRef = useRef<FullCalendar | null>(null);

    // A 7-day grid on a 390px screen gives each day ~25px, which shredded every
    // event title into vertical gibberish. Phones get an agenda list instead —
    // the one view that actually reads at that width — inside a carousel that
    // swipes between periods. Drag-to-reschedule and drag-out-to-delete are
    // desktop-only affordances, so none of those handlers apply there.
    if (isMobile) {
        return (
            <SwipeableCalendar
                events={events}
                handleEventClick={handleEventClick}
                handleDateClick={handleDateClick}
            />
        );
    }

    return (
        <StyledCalendarWrapper>
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                weekends={true}
                events={events}
                allDaySlot={false}
                // Without this a busy day in month view grows the row until the
                // grid loses its shape; anything beyond what fits collapses
                // into a "+N więcej" link.
                dayMaxEvents={true}
                height="auto"
                slotMinTime="09:00:00"
                slotMaxTime="22:00:00"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek',
                }}
                editable={true}
                eventDurationEditable={false}
                locale={plLocale}
                // The Polish locale labels every list view "Plan dnia" (day
                // plan), but listWeek spans a week — the button said one thing
                // and showed another. Name it for what it actually displays.
                views={{ listWeek: { buttonText: 'Tydzień' } }}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                eventDragStart={onEventDragStart}
                eventDragStop={onEventDragStop}
                eventDrop={onEventDrop}
                nowIndicator={true}
                eventContent={(arg) => (
                    <EventContent
                        timeText={arg.timeText}
                        event={arg.event}
                        showTime={!arg.view.type.startsWith('list')}
                    />
                )}
            />
        </StyledCalendarWrapper>
    );
};

export default FullCalendarWrapper;
