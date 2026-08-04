import { alpha, styled } from '@mui/material/styles';

/**
 * FullCalendar ships its own CSS and knows nothing about the MUI theme, so the
 * calendar has to be dressed to match by hand. This aims at the same language
 * as the DataGrid: hairline borders, a quiet tinted header, outlined controls,
 * and the bronze reserved for state (today, selected view, events).
 *
 * Previously the header was a solid `primary.main` bar with `text.secondary`
 * on top — grey on gold, effectively unreadable — and the disabled button set
 * background *and* colour to `action.disabled`, so "Dziś" vanished when there
 * was nothing to go back to.
 */
export const StyledCalendarWrapper = styled('div')(({ theme }) => {
  const isLight = theme.palette.mode === 'light';
  const headerTint = isLight ? '#fafbfc' : alpha('#ffffff', 0.02);
  const gold = theme.palette.primary.main;

  return {
    '& .fc': {
      fontFamily: theme.typography.fontFamily,
      '--fc-border-color': theme.palette.divider,
      '--fc-page-bg-color': theme.palette.background.paper,
      '--fc-neutral-bg-color': headerTint,
      // Was a strong cream block; now a whisper of the brand bronze.
      '--fc-today-bg-color': alpha(gold, isLight ? 0.06 : 0.1),
      '--fc-event-bg-color': gold,
      '--fc-event-border-color': gold,
      '--fc-event-text-color': theme.palette.primary.contrastText,
      fontSize: '0.875rem',
    },

    '& .fc-scrollgrid, & .fc-scrollgrid table, & .fc-daygrid, & .fc-daygrid-table, & .fc-timegrid, & .fc-timegrid-table':
      {
        borderCollapse: 'collapse',
        borderSpacing: 0,
      },
    '& .fc-scrollgrid': {
      borderRadius: 12,
      overflow: 'hidden',
    },
    '& .fc-scrollgrid, & .fc-scrollgrid table, & .fc-daygrid-day, & .fc-timegrid-slot, & .fc-timegrid-col, & .fc-timegrid-axis, & .fc-timegrid-slot-label, & .fc-timegrid-slot-lane, & .fc-col-header-cell':
      {
        borderColor: theme.palette.divider,
      },

    // Day-of-week header: legible dark-on-tint, matching the DataGrid header.
    '& .fc-col-header-cell': {
      background: headerTint,
      color: theme.palette.text.secondary,
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

    // Hour gutter and day numbers.
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

    // Toolbar controls styled as outlined MUI buttons rather than gold slabs.
    '& .fc-button': {
      background: 'transparent',
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`,
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
      cursor: 'pointer',
      '&:focus': { boxShadow: 'none', outline: 'none' },
    },
    '& .fc-button:hover': {
      background: theme.palette.action.hover,
      borderColor: alpha(gold, 0.5),
    },
    '& .fc-button:disabled': {
      background: 'transparent',
      // The old rule painted the label the same colour as the fill.
      color: theme.palette.text.disabled,
      borderColor: theme.palette.divider,
      opacity: 1,
      cursor: 'not-allowed',
    },
    // Selector mirrors FullCalendar's own
    // `.fc-button-primary:not(:disabled).fc-button-active` — a plain
    // `.fc-button.fc-button-active` loses to it on specificity and the active
    // view button stayed FullCalendar's default navy slab.
    '& .fc-button-primary:not(:disabled).fc-button-active, & .fc-button-primary:not(:disabled):active':
      {
        background: alpha(gold, isLight ? 0.12 : 0.2),
        borderColor: alpha(gold, 0.5),
        color: gold,
        boxShadow: 'none',
      },
    '& .fc-button-primary:not(:disabled).fc-button-active:hover': {
      background: alpha(gold, isLight ? 0.18 : 0.26),
    },
    // Prev/next sit as one segmented control.
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
    '& .fc-timegrid-now-indicator-line': {
      borderColor: theme.palette.error.main,
    },
  };
});
