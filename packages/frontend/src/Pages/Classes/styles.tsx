import { styled } from '@mui/material/styles';

export const StyledCalendarWrapper = styled('div')(({ theme }) => ({
  // Style FullCalendar's table to match MUI Table borders
  '& .fc': {
    fontFamily: theme.typography.fontFamily,
    '--fc-border-color': theme.palette.divider,
    '--fc-page-bg-color': theme.palette.background.default,
  },
  '& .fc-scrollgrid, & .fc-scrollgrid table, & .fc-daygrid, & .fc-daygrid-table, & .fc-timegrid, & .fc-timegrid-table': {
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },
  '& .fc-scrollgrid, & .fc-scrollgrid table, & .fc-daygrid, & .fc-daygrid-table, & .fc-daygrid-day, & .fc-timegrid, & .fc-timegrid-table, & .fc-timegrid-slot, & .fc-timegrid-col, & .fc-timegrid-axis, & .fc-timegrid-slots, & .fc-timegrid-slot-label, & .fc-timegrid-slot-lane, & .fc-col-header-cell': {
    border: `1px solid ${theme.palette.divider}`,
  },
  // '& .fc-daygrid-day, & .fc-daygrid-week-number, & .fc-daygrid-day-number, & .fc-timegrid-slot, & .fc-timegrid-col, & .fc-timegrid-axis, & .fc-timegrid-slot-label, & .fc-timegrid-slot-lane': {
  //   backgroundColor: theme.palette.background.paper,
  // },
  'thead, .fc-col-header-cell,  .fc-scrollgrid-section-header': {
    border: 'none',
    background: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.subtitle2.fontSize,
    letterSpacing: theme.typography.subtitle2.letterSpacing,
    textTransform: 'uppercase',
    boxShadow: theme.shadows[1],
  },
  '& .fc-button': {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 2),
    textTransform: 'uppercase',
    fontWeight: 500,
    fontSize: theme.typography.button.fontSize,
    boxShadow: theme.shadows[1],
    transition: theme.transitions.create(['background', 'box-shadow'], {
      duration: theme.transitions.duration.short,
    }),
    cursor: 'pointer',
  },
  '& .fc-button:hover, & .fc-button:focus': {
    background: theme.palette.primary.main,
    boxShadow: 'none',
  },
  '& .fc-button:disabled': {
    background: theme.palette.action.disabled,
    color: theme.palette.action.disabled,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  '& .fc-button.fc-button-active, & .fc-button:active': {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: 'none',
  },
}));
