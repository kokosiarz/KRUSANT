import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

interface EventContentProps {
  timeText: string;
  event: {
    title: string;
    extendedProps?: {
      attendeeNames?: string[];
    };
  };
  /**
   * The agenda list renders its own time column, so repeating the time in the
   * content there would just eat the width the roster needs. The grids have no
   * such column and do need it.
   */
  showTime?: boolean;
}

const EventContent: React.FC<EventContentProps> = ({ timeText, event, showTime = true }) => {
  const attendeeNames = event.extendedProps?.attendeeNames ?? [];

  const tooltipContent = attendeeNames.length > 0
    ? attendeeNames.join('\n')
    : 'Brak obecnych';

  return (
    <Tooltip
      title={
        <Box sx={{ whiteSpace: 'pre-line' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {event.title}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Obecni:
          </Typography>
          {'\n'}
          {tooltipContent}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      >
        {/* Deliberately allowed to wrap: a week-grid event is often tall and
            narrow, and clipping this to one line hides the room. The month
            grid, where cells are short, clamps it instead — see
            `.fc-daygrid-event` in styles.tsx. */}
        <Typography
          variant="caption"
          sx={{ display: 'block', lineHeight: 1.2, overflowWrap: 'anywhere' }}
        >
          {showTime ? `${timeText} ${event.title}` : event.title}
        </Typography>
        {attendeeNames.length > 0 && (
          <Typography
            variant="caption"
            // Hook for the agenda list, which wraps this to two lines instead
            // of ellipsizing it — see StyledCalendarWrapper in styles.tsx.
            className="krusant-event-attendees"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
              opacity: 0.85,
              fontSize: '0.65rem',
            }}
          >
            ✓ {attendeeNames.join(', ')}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

export default EventContent;
