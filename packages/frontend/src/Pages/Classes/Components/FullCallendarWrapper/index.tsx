import React, { useRef, useState } from 'react';
import { StyledCalendarWrapper } from './styles';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin, { DateClickArg, EventDragStopArg } from '@fullcalendar/interaction'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useClassEventsWithNames } from './hooks/useClassEventsWithNames';
import plLocale from '@fullcalendar/core/locales/pl';
import { Class } from '@/api/endpoints/classes';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import EventContent from './EventContent';

/** Below this a touch reads as a tap or a scroll, not a swipe. */
const SWIPE_MIN_DISTANCE = 60;
/** How much more horizontal than vertical the movement has to be. */
const SWIPE_HORIZONTAL_RATIO = 1.5;
/** Fraction of the container width the drag can travel 1:1 before resistance kicks in. */
const RUBBER_BAND_RATIO = 0.22;
/** Fraction of the container width the content slides fully off before the week swaps. */
const EXIT_RATIO = 0.9;
/** Duration of the spring-back / slide-in animations. */
const SETTLE_MS = 220;

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
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    // Live drag offset applied as a transform, plus whether it should animate
    // (spring back / slide in) or track the finger 1:1 with no transition.
    const [dragX, setDragX] = useState(0);
    const [isSettling, setIsSettling] = useState(false);

    const getWidth = () => wrapperRef.current?.offsetWidth || 320;

    // Swiping left/right moves to the next/previous period — the natural
    // gesture on a phone, where the prev/next buttons are small targets.
    const onTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
        setIsSettling(false);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        const start = touchStart.current;
        if (!start) return;
        const t = e.touches[0];
        if (!t) return;

        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Not clearly horizontal yet (or this is a vertical scroll of the
        // agenda list) — don't drag the calendar along with the finger.
        if (Math.abs(dx) < Math.abs(dy) * SWIPE_HORIZONTAL_RATIO) {
            if (dragX !== 0) setDragX(0);
            return;
        }

        // Rubber-band past the limit so the drag reads as "pulling a sheet"
        // rather than tracking the finger forever.
        const limit = getWidth() * RUBBER_BAND_RATIO;
        const overflow = Math.max(0, Math.abs(dx) - limit);
        const eased = Math.min(Math.abs(dx), limit) + overflow * 0.35;
        setDragX(dx < 0 ? -eased : eased);
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const start = touchStart.current;
        touchStart.current = null;
        const t = e.changedTouches[0];
        if (!start || !t) {
            setIsSettling(true);
            setDragX(0);
            return;
        }

        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Must be clearly horizontal, or scrolling the agenda list vertically
        // would flick the user into another week by accident.
        const isSwipe = Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) >= Math.abs(dy) * SWIPE_HORIZONTAL_RATIO;

        if (!isSwipe) {
            setIsSettling(true);
            setDragX(0);
            window.setTimeout(() => setIsSettling(false), SETTLE_MS);
            return;
        }

        const api = calendarRef.current?.getApi();
        const goingNext = dx < 0;
        const exitDistance = getWidth() * EXIT_RATIO;

        // Slide the current week fully off in the swipe direction first...
        setIsSettling(true);
        setDragX(goingNext ? -exitDistance : exitDistance);

        window.setTimeout(() => {
            if (api) {
                if (goingNext) api.next();
                else api.prev();
            }
            // ...jump to the trailing edge with no transition (the new week is
            // already in place underneath)...
            setIsSettling(false);
            setDragX(goingNext ? exitDistance : -exitDistance);
            requestAnimationFrame(() => {
                // ...then slide it back to center, reading as the new week
                // arriving from the direction the user swiped.
                setIsSettling(true);
                setDragX(0);
                window.setTimeout(() => setIsSettling(false), SETTLE_MS);
            });
        }, SETTLE_MS);
    };

    const onTouchCancel = () => {
        touchStart.current = null;
        setIsSettling(true);
        setDragX(0);
        window.setTimeout(() => setIsSettling(false), SETTLE_MS);
    };

    const swipeProgress = Math.min(Math.abs(dragX) / SWIPE_MIN_DISTANCE, 1);
    const swipeDirection = dragX < 0 ? 'next' : dragX > 0 ? 'prev' : null;

    return (
        <StyledCalendarWrapper
            ref={wrapperRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
        >
            {swipeDirection && (
                <Box
                    sx={(theme) => ({
                        position: 'absolute',
                        top: '50%',
                        [swipeDirection === 'prev' ? 'left' : 'right']: 8,
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.12 : 0.2),
                        opacity: swipeProgress,
                    })}
                >
                    {swipeDirection === 'prev' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </Box>
            )}
            <Box
                sx={{
                    transform: `translateX(${dragX}px)`,
                    transition: isSettling ? `transform ${SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
                    willChange: 'transform',
                }}
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
            </Box>
        </StyledCalendarWrapper>
    );
};

export default FullCalendarWrapper;
