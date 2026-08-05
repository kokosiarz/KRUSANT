import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import plLocale from '@fullcalendar/core/locales/pl';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventContent from './EventContent';
import { StyledCalendarWrapper } from './styles';
import { haptics } from '@/utils/haptics';

export type MobileView = 'listWeek' | 'dayGridMonth';

/** Below this a touch reads as a tap or a scroll, not a swipe. */
const SWIPE_MIN_DISTANCE = 60;
/** How much more horizontal than vertical the movement has to be. */
const SWIPE_HORIZONTAL_RATIO = 1.5;
/** How long the track takes to settle onto a neighbouring period. */
const SETTLE_MS = 260;
/** Slot offsets rendered either side of the current period. */
const SLOTS = [-1, 0, 1] as const;

/** Month anchors sit on the 1st so month arithmetic can't skid off a 31st. */
function normalizeAnchor(date: Date, view: MobileView): Date {
  return view === 'dayGridMonth'
    ? new Date(date.getFullYear(), date.getMonth(), 1)
    : date;
}

function addPeriods(date: Date, view: MobileView, count: number): Date {
  const d = new Date(date);
  if (view === 'dayGridMonth') d.setMonth(d.getMonth() + count);
  else d.setDate(d.getDate() + count * 7);
  return d;
}

const keyOf = (date: Date, view: MobileView) =>
  `${view}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

interface SwipeableCalendarProps {
  events: EventInput[];
  handleEventClick?: (arg: EventClickArg) => void;
  handleDateClick?: (arg: DateClickArg) => void;
}

/**
 * The phone calendar, as a carousel.
 *
 * The previous and next periods are mounted either side of the current one and
 * move with the finger, so a swipe drags the next week into place instead of
 * pushing the current one into a blank gap and swapping the content at the
 * midpoint. Dragging and settling are one continuous translate of a single
 * track — there is no content swap to hide.
 *
 * Because the panes are real calendars rather than snapshots, they need their
 * own dates, which `initialDate` only reads at mount. Keying each pane by its
 * date is what makes that work: after a swipe the array shifts by one, React
 * matches two of the three keys and keeps those instances, and only the newly
 * exposed far side mounts.
 *
 * FullCalendar's own toolbar can't be reused here — each pane would render its
 * own copy and slide away with the content — so the header below replaces it.
 */
const SwipeableCalendar: React.FC<SwipeableCalendarProps> = ({
  events,
  handleEventClick,
  handleDateClick,
}) => {
  const [view, setView] = useState<MobileView>('listWeek');
  const [anchor, setAnchor] = useState<Date>(() => normalizeAnchor(new Date(), 'listWeek'));
  const [dragX, setDragX] = useState(0);
  const [settleDir, setSettleDir] = useState<-1 | 0 | 1 | null>(null);
  const [paneWidth, setPaneWidth] = useState(0);
  /** Titles reported by each pane, so the header can show FullCalendar's own wording. */
  const [titles, setTitles] = useState<Record<string, string>>({});

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const passedThreshold = useRef(false);

  // The track is positioned in pixels, so it has to know how wide a pane is —
  // and follow it across rotation and the address bar showing and hiding.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setPaneWidth(el.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const panes = useMemo(
    () => SLOTS.map((offset) => addPeriods(anchor, view, offset)),
    [anchor, view]
  );

  const settling = settleDir !== null;
  const currentKey = keyOf(anchor, view);
  const title =
    titles[currentKey] ??
    new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(anchor);

  const onPaneTitle = useCallback((key: string, paneTitle: string) => {
    setTitles((prev) => (prev[key] === paneTitle ? prev : { ...prev, [key]: paneTitle }));
  }, []);

  /**
   * Animate to a neighbour, then hand over.
   *
   * The hand-over is the whole trick: moving the anchor re-keys the panes so
   * the one that just slid into view becomes the middle one, and resetting the
   * track by exactly one pane cancels that shift out. Both have to land in the
   * same commit — hence flushSync — or the two changes paint separately and
   * the calendar visibly jumps back a period before correcting itself.
   */
  const settleTo = useCallback(
    (dir: -1 | 0 | 1) => {
      setSettleDir(dir);
      window.setTimeout(() => {
        flushSync(() => {
          if (dir !== 0) setAnchor((prev) => addPeriods(prev, view, dir));
          setSettleDir(null);
          setDragX(0);
        });
        if (dir !== 0) haptics.impact();
      }, SETTLE_MS);
    },
    [view]
  );

  const step = (dir: -1 | 1) => {
    if (settling) return;
    settleTo(dir);
  };

  const goToday = () => {
    if (settling) return;
    setTitles({});
    setAnchor(normalizeAnchor(new Date(), view));
  };

  const changeView = (next: MobileView) => {
    setTitles({});
    setView(next);
    setAnchor((prev) => normalizeAnchor(prev, next));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (settling) return;
    const t = e.touches[0];
    touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
    passedThreshold.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const start = touchStart.current;
    if (!start || settling) return;
    const t = e.touches[0];
    if (!t) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Not clearly horizontal — this is the agenda being scrolled, so leave the
    // track alone rather than dragging the week sideways under the finger.
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_HORIZONTAL_RATIO) {
      if (dragX !== 0) setDragX(0);
      return;
    }

    // One period per gesture: past a full pane there is nothing further loaded
    // to reveal, so let it stop rather than drag out a blank.
    const limit = paneWidth || 320;
    setDragX(Math.max(-limit, Math.min(limit, dx)));

    if (!passedThreshold.current && Math.abs(dx) >= SWIPE_MIN_DISTANCE) {
      // Fires once, as the swipe becomes committal — the same moment releasing
      // would now change the period rather than spring back.
      passedThreshold.current = true;
      haptics.tick();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || settling) return;
    const t = e.changedTouches[0];
    if (!t) {
      settleTo(0);
      return;
    }

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const isSwipe =
      Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) >= Math.abs(dy) * SWIPE_HORIZONTAL_RATIO;

    settleTo(isSwipe ? (dx < 0 ? 1 : -1) : 0);
  };

  const onTouchCancel = () => {
    touchStart.current = null;
    if (!settling) settleTo(0);
  };

  // Resting position shows the middle pane; settling slides a whole pane either
  // way, and the reset back to centre rides along with the re-keying above.
  const offset = settling
    ? -paneWidth - (settleDir as number) * paneWidth
    : -paneWidth + dragX;

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton onClick={() => step(-1)} aria-label="Poprzedni okres">
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 650,
              letterSpacing: '-0.012em',
              textAlign: 'center',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
          <IconButton onClick={() => step(1)} aria-label="Następny okres">
            <ChevronRightIcon />
          </IconButton>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={view}
            onChange={(_e, next: MobileView | null) => next && changeView(next)}
          >
            <ToggleButton value="listWeek">Tydzień</ToggleButton>
            <ToggleButton value="dayGridMonth">Miesiąc</ToggleButton>
          </ToggleButtonGroup>
          {/* Swiping makes it easy to drift a long way from now, and there is
              no other way back short of swiping all the way. */}
          <Button size="small" onClick={goToday}>
            Dziś
          </Button>
        </Stack>
      </Stack>

      <Box
        ref={viewportRef}
        data-testid="calendar-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
        sx={{
          overflowX: 'hidden',
          // Vertical scrolling stays with the browser; horizontal is ours.
          touchAction: 'pan-y',
        }}
      >
        <Box
          ref={trackRef}
          sx={{
            display: 'flex',
            width: `${SLOTS.length * 100}%`,
            transform: `translateX(${offset}px)`,
            transition: settling
              ? `transform ${SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : 'none',
            willChange: 'transform',
          }}
        >
          {panes.map((paneDate) => {
            const key = keyOf(paneDate, view);
            return (
              <Box key={key} sx={{ width: `${100 / SLOTS.length}%`, flexShrink: 0 }}>
                <StyledCalendarWrapper>
                  <FullCalendar
                    plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                    initialView={view}
                    initialDate={paneDate}
                    headerToolbar={false}
                    weekends
                    events={events}
                    allDaySlot={false}
                    dayMaxEvents
                    height="auto"
                    locale={plLocale}
                    // Dragging is a desktop affordance; on touch it mostly
                    // produces accidental reschedules. Tapping still opens.
                    editable={false}
                    eventDurationEditable={false}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    nowIndicator
                    datesSet={(arg) => onPaneTitle(key, arg.view.title)}
                    eventContent={(arg) => (
                      <EventContent
                        timeText={arg.timeText}
                        event={arg.event}
                        showTime={!arg.view.type.startsWith('list')}
                      />
                    )}
                  />
                </StyledCalendarWrapper>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default SwipeableCalendar;
