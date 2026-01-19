import { StyledCalendarWrapper } from './styles';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg, EventDragStopArg } from '@fullcalendar/interaction'
import { useClassEventsWithNames } from './hooks/useClassEventsWithNames';
import plLocale from '@fullcalendar/core/locales/pl';
import { Class } from '@/api/endpoints/classes';
import { EventClickArg } from '@fullcalendar/core';

interface FullCalendarWrapperProps {
    classes: Class[];
    handleEventClick?: (arg: EventClickArg) => void;
    handleDateClick?: (arg: DateClickArg) => void;
    onEventDragStop?: (arg: EventDragStopArg) => void;
}

export const FullCalendarWrapper: React.FC<FullCalendarWrapperProps> = ({
    classes,
    handleEventClick,
    handleDateClick,
    onEventDragStop,
}) => {
    const events = useClassEventsWithNames(classes);

    return (
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
                eventDragStop={onEventDragStop}
                nowIndicator={true}
            />
        </StyledCalendarWrapper>
    );
};

export default FullCalendarWrapper;
