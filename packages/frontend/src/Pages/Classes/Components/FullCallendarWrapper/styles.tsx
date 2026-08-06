import { alpha, styled } from '@mui/material/styles';

/**
 * FullCalendar dressed to match the MUI theme.
 *
 * **Set variables, don't fight selectors.** FullCalendar 6 exposes ~27 `--fc-*`
 * custom properties and styles itself from them. Earlier versions of this file
 * overrode its rules directly, which meant losing specificity battles against
 * things like `.fc-button-primary:not(:disabled).fc-button-active` and then
 * escalating to match them. Every colour below that *can* be a variable is one;
 * the handful of real rules that remain are for shape and typography, which
 * FullCalendar doesn't expose.
 */
export const StyledCalendarWrapper = styled('div')(({ theme }) => {
  const isLight = theme.palette.mode === 'light';
  const surfaceTint = isLight ? '#fafbfc' : alpha('#ffffff', 0.02);
  const gold = theme.palette.primary.main;

  return {
    position: 'relative',
    // Clips the outgoing/incoming week during the swipe slide animation so it
    // doesn't spill past the card edge while translated off-center.
    overflowX: 'hidden',

    '& .fc': {
      fontFamily: theme.typography.fontFamily,
      fontSize: '0.875rem',

      // --- surfaces and lines -------------------------------------------
      '--fc-page-bg-color': theme.palette.background.paper,
      '--fc-border-color': theme.palette.divider,
      '--fc-neutral-bg-color': surfaceTint,
      '--fc-neutral-text-color': theme.palette.text.secondary,
      '--fc-small-font-size': '0.75rem',

      // Was a strong cream block; now a whisper of the brand bronze.
      '--fc-today-bg-color': alpha(gold, isLight ? 0.06 : 0.1),
      '--fc-highlight-color': alpha(gold, isLight ? 0.12 : 0.18),
      '--fc-now-indicator-color': theme.palette.error.main,
      '--fc-non-business-color': alpha(theme.palette.text.disabled, 0.08),

      // --- toolbar buttons ----------------------------------------------
      // These are exactly the properties the old file was overriding by
      // selector. As variables they simply win, with no specificity contest.
      '--fc-button-bg-color': 'transparent',
      '--fc-button-border-color': theme.palette.divider,
      '--fc-button-text-color': theme.palette.text.primary,
      '--fc-button-hover-bg-color': theme.palette.action.hover,
      '--fc-button-hover-border-color': alpha(gold, 0.5),
      '--fc-button-active-bg-color': alpha(gold, isLight ? 0.12 : 0.2),
      '--fc-button-active-border-color': alpha(gold, 0.5),

      // --- events --------------------------------------------------------
      '--fc-event-bg-color': gold,
      '--fc-event-border-color': gold,
      '--fc-event-text-color': theme.palette.primary.contrastText,
      '--fc-event-selected-overlay-color': alpha(theme.palette.common.black, 0.15),
      '--fc-bg-event-color': alpha(gold, 0.25),
      '--fc-bg-event-opacity': '0.3',

      // --- month-view overflow + agenda ----------------------------------
      '--fc-more-link-bg-color': surfaceTint,
      '--fc-more-link-text-color': theme.palette.text.secondary,
      '--fc-list-event-hover-bg-color': theme.palette.action.hover,
    },

    // ---- shape and typography: not expressible as variables -------------

    '& .fc-scrollgrid': { borderRadius: 12, overflow: 'hidden' },

    '& .fc-col-header-cell': {
      background: surfaceTint,
      fontWeight: 650,
      fontSize: '0.75rem',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      padding: theme.spacing(1, 0.5),
    },
    '& .fc-col-header-cell.fc-day-today': {
      color: gold,
      background: alpha(gold, isLight ? 0.09 : 0.14),
    },
    '& .fc-col-header-cell a': { color: 'inherit', textDecoration: 'none' },

    '& .fc-timegrid-slot-label-cushion, & .fc-daygrid-day-number': {
      color: theme.palette.text.secondary,
      fontSize: '0.75rem',
      fontVariantNumeric: 'tabular-nums',
    },

    '& .fc-toolbar-title': {
      fontSize: '1.125rem',
      fontWeight: 650,
      letterSpacing: '-0.012em',
      color: theme.palette.text.primary,
    },

    '& .fc-button': {
      borderRadius: 8,
      padding: theme.spacing(0.75, 1.75),
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      boxShadow: 'none',
      transition: theme.transitions.create(['background-color', 'border-color'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:focus': { boxShadow: 'none', outline: 'none' },
    },
    // The variable covers the colour; this keeps the label readable, which
    // `--fc-button-text-color` alone would not (it applies to every state).
    '& .fc-button:disabled': {
      color: theme.palette.text.disabled,
      opacity: 1,
      cursor: 'not-allowed',
    },
    '& .fc-button-primary:not(:disabled).fc-button-active': { color: gold },

    // The "Moje" filter is a FullCalendar custom button, which has no built-in
    // notion of being switched on — so being on is painted here, borrowing the
    // look of an active view button. Driven by the data attribute the wrapper
    // sets, since the button element itself carries no state.
    '&[data-only-mine="true"] .fc-onlyMine-button': {
      backgroundColor: alpha(gold, isLight ? 0.12 : 0.2),
      borderColor: alpha(gold, 0.5),
      color: gold,
    },

    // Prev/next read as one segmented control.
    '& .fc-button-group': { gap: 0 },
    '& .fc-button-group .fc-button:not(:last-of-type)': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& .fc-button-group .fc-button:not(:first-of-type)': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      marginLeft: -1,
    },
    '& .fc-toolbar.fc-header-toolbar': {
      marginBottom: theme.spacing(2),
      gap: theme.spacing(1.5),
      flexWrap: 'wrap',
    },

    '& .fc-event': {
      borderRadius: 6,
      border: 'none',
      padding: '1px 4px',
      fontSize: '0.75rem',
      fontWeight: 600,
      cursor: 'pointer',
    },

    // A 30-minute class is about 23px tall in the week grid, but its content is
    // two lines — the title and the attendee list. Without clipping, the text
    // runs straight out of the block and over the slot underneath, which reads
    // as two events overlapping.
    '& .fc-timegrid-event, & .fc-timegrid-event .fc-event-main': {
      overflow: 'hidden',
    },

    // A finished class fades rather than disappearing — still there to click
    // into, but visually out of the way of what's still upcoming this week.
    '& .fc-event-past': {
      opacity: isLight ? 0.45 : 0.4,
    },
    '& tr.fc-list-event.fc-event-past': {
      opacity: isLight ? 0.5 : 0.45,
    },
    '& tr.fc-list-event.fc-event-past:hover': {
      opacity: 0.8,
    },

    // Month cells are narrow and the custom eventContent doesn't wrap, so a
    // long group name ran straight over the cell border. Clip it with an
    // ellipsis instead; the full text is in the class dialog.
    '& .fc-daygrid-event': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      '& *': {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },
    '& .fc-daygrid-more-link': {
      fontSize: '0.6875rem',
      fontWeight: 650,
      color: theme.palette.text.secondary,
    },

    // ---- agenda (mobile) -------------------------------------------------
    // This view had no styling at all: it rendered in FullCalendar's defaults
    // while everything around it followed the theme. Increase vertical spacing
    // between list rows so items are easier to hit on phones.
    '& .fc-list': {
      borderRadius: 12,
      overflow: 'hidden',
      borderColor: theme.palette.divider,
    },
    // FullCalendar renders the list as a table. Add padding and a hairline
    // divider to each row's cells for clearer separation between events.
    '& .fc-list .fc-list-table tr.fc-list-item td': {
      padding: theme.spacing(1.25, 1.5),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& .fc-list-day-cushion': {
      background: surfaceTint,
      padding: theme.spacing(1, 1.5),
    },
    '& .fc-list-day-text, & .fc-list-day-side-text': {
      fontWeight: 600,
      color: theme.palette.text.secondary,
      fontSize: '0.8125rem',
      // color: theme.palette.text.primary,
      textDecoration: 'none',
    },

    // Today, in the agenda. The grids get this for free — FullCalendar tints
    // the whole column from `--fc-today-bg-color` — but a list has no column,
    // and the `.fc-list-day-cushion` rule above would paint over any default
    // anyway. So the day's header band and its rows are tinted by hand, keeping
    // the same relationship the desktop has: a stronger header, subtler cells.
    '& .fc-list-day.fc-day-today .fc-list-day-cushion': {
      background: alpha(gold, isLight ? 0.12 : 0.18),
    },
    '& .fc-list-day.fc-day-today .fc-list-day-text, & .fc-list-day.fc-day-today .fc-list-day-side-text': {
      color: gold,
    },
    // Scoped to `.fc-list-event`, which only exists in the agenda — the same
    // class on a grid event would repaint the event itself, over its group
    // colour. The class comes from useClassEventsWithNames.
    '& .fc-list-event.krusant-event-today td': {
      backgroundColor: alpha(gold, isLight ? 0.06 : 0.1),
    },
    // The agenda is a table, and a long attendee line used to drag the whole
    // row out of shape: the names are nowrap, so the title cell's min-content
    // width grew with them, and the auto table layout paid for that out of the
    // time column — chopping "09:00 - 14:00" off on the left. Pinning the time
    // and dot columns to their natural width (`width: 1%` is the shrink-to-fit
    // idiom) and letting the title be the column that absorbs the slack keeps
    // the overflow inside the title, where it ellipsizes instead of clipping
    // something else.
    '& .fc-list-event-time': {
      color: theme.palette.text.secondary,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      width: '1%',
    },
    '& .fc-list-event-graphic': { width: '1%' },
    // max-width:0 stops the cell's content from setting the column's width;
    // width:100% then makes it take everything the other two don't need.
    '& .fc-list-event-title': {
      width: '100%',
      maxWidth: 0,
      overflow: 'hidden',
    },
    '& .fc-list-event-title a': {
      color: theme.palette.text.primary,
      fontWeight: 300,
      textDecoration: 'none',
    },
    // On a phone a single ellipsized line hides most of a class's roster, and
    // there is width to spare here that the month grid doesn't have. Wrap to
    // two lines instead, then clamp.
    '& .fc-list-event-title .krusant-event-attendees': {
      whiteSpace: 'normal',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    '& .fc-list-event-dot': { borderColor: gold },
    '& .fc-list-empty': {
      background: 'transparent',
      color: theme.palette.text.secondary,
    },
  };
});
