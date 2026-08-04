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

    return (
        <StyledCalendarWrapper>
            <FullCalendar
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
