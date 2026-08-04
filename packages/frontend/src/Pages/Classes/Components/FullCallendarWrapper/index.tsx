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

/** Below this a touch reads as a tap or a scroll, not a swipe. */
const SWIPE_MIN_DISTANCE = 60;
/** How much more horizontal than vertical the movement has to be. */
const SWIPE_HORIZONTAL_RATIO = 1.5;

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
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    // Swiping left/right moves to the next/previous period — the natural
    // gesture on a phone, where the prev/next buttons are small targets.
    const onTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const start = touchStart.current;
        touchStart.current = null;
        const t = e.changedTouches[0];
        if (!start || !t) return;

        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Must be clearly horizontal, or scrolling the agenda list vertically
        // would flick the user into another week by accident.
        if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return;
        if (Math.abs(dx) < Math.abs(dy) * SWIPE_HORIZONTAL_RATIO) return;

        const api = calendarRef.current?.getApi();
        if (!api) return;
        if (dx < 0) api.next();
        else api.prev();
    };

    return (
        <StyledCalendarWrapper
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
                // A 7-day grid on a 390px screen gives each day ~25px, which
                // shredded every event title into vertical gibberish. Phones get
                // an agenda list instead — the one view that actually reads at
                // that width.
                initialView={isMobile ? 'listWeek' : 'timeGridWeek'}
                key={isMobile ? 'mobile' : 'desktop'}
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
                headerToolbar={
                    isMobile
                        ? { left: 'prev,next', center: 'title', right: 'listWeek,dayGridMonth' }
                        : {
                              left: 'prev,next today',
                              center: 'title',
                              right: 'dayGridMonth,timeGridWeek',
                          }
                }
                // Dragging is a desktop affordance; on touch it mostly produces
                // accidental reschedules. Tapping an event still opens it.
                editable={!isMobile}
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
                eventContent={(arg) => <EventContent timeText={arg.timeText} event={arg.event} />}
            />
        </StyledCalendarWrapper>
    );
};

export default FullCalendarWrapper;
