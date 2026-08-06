import React, { useMemo, useRef } from 'react';
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

/**
 * "Show only my classes", rendered inside the calendar's own toolbar rather
 * than above it — a filter used this rarely doesn't earn a row of its own on a
 * phone. Omitted entirely for anyone who doesn't teach.
 */
export interface ScopeFilter {
    onlyMine: boolean;
    onChange: (onlyMine: boolean) => void;
}

interface FullCalendarWrapperProps {
    classes: Class[];
    scopeFilter?: ScopeFilter;
    handleEventClick?: (arg: EventClickArg) => void;
    handleDateClick?: (arg: DateClickArg) => void;
    onEventDragStart?: () => void;
    onEventDragStop?: (arg: EventDragStopArg) => void;
    onEventDrop?: (arg: EventDropArg) => void;
}

export const FullCalendarWrapper: React.FC<FullCalendarWrapperProps> = ({
    classes,
    scopeFilter,
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

    // Desktop puts the filter in FullCalendar's toolbar as a custom button, so
    // it shares the row with the view switcher instead of adding one. Memoised
    // because a fresh object each render makes FullCalendar rebuild the toolbar.
    const customButtons = useMemo(
        () =>
            scopeFilter
                ? {
                      onlyMine: {
                          text: 'Moje',
                          hint: 'Pokaż tylko moje zajęcia',
                          click: () => scopeFilter.onChange(!scopeFilter.onlyMine),
                      },
                  }
                : undefined,
        [scopeFilter]
    );

    // A 7-day grid on a 390px screen gives each day ~25px, which shredded every
    // event title into vertical gibberish. Phones get an agenda list instead —
    // the one view that actually reads at that width — inside a carousel that
    // swipes between periods. Drag-to-reschedule and drag-out-to-delete are
    // desktop-only affordances, so none of those handlers apply there.
    if (isMobile) {
        return (
            <SwipeableCalendar
                events={events}
                scopeFilter={scopeFilter}
                handleEventClick={handleEventClick}
                handleDateClick={handleDateClick}
            />
        );
    }

    return (
        // FullCalendar's custom buttons have no notion of being "on", so the
        // pressed state is styled from here — see styles.tsx.
        <StyledCalendarWrapper data-only-mine={scopeFilter?.onlyMine ? 'true' : undefined}>
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
                // Concurrent classes sit side by side instead of the later one
                // being drawn over the earlier. FullCalendar's default overlaps
                // them to save width, which buried the first class's group,
                // room and attendee list under the second's box.
                slotEventOverlap={false}
                customButtons={customButtons}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    // Space separates groups, comma joins them — so the filter
                    // reads as its own control beside the view switcher.
                    right: scopeFilter
                        ? 'onlyMine dayGridMonth,timeGridWeek'
                        : 'dayGridMonth,timeGridWeek',
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
