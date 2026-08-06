import React from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';

/**
 * Enough room under the content for the button to sit over nothing.
 *
 * The button is 56px and clears the bottom by 20, so anything less than this
 * leaves the last row of a list permanently half-covered with no way to scroll
 * it clear — the page has already ended.
 */
const CLEARANCE = 96;

/**
 * The "add one" action for a page, parked bottom-right.
 *
 * It started on the calendar, where the desktop affordance — clicking an empty
 * grid cell — has no equivalent in the phone's agenda view, so there was no way
 * to create a class at all. It works just as well as the primary action on a
 * list page, and keeping it in one place means the two don't drift apart in
 * position or size.
 *
 * Fixed rather than scrolling with the content: on a long list the thing you
 * most want after reading to the bottom is to add another, and a button that
 * has scrolled away a screen ago doesn't help.
 */
const AddFab: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <>
    {/* Rendered in the flow, where this component sits at the end of the page's
        content — so the spacer lands under the last row, which is exactly where
        the fixed button needs the room. */}
    <Box aria-hidden sx={{ height: CLEARANCE }} />
    <Tooltip title={label}>
      <Fab
        color="primary"
        aria-label={label}
        onClick={onClick}
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          // Above the content but below dialogs and the drawers.
          zIndex: (t) => t.zIndex.speedDial,
        }}
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  </>
);

export default AddFab;
