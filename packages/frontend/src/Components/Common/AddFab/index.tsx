import React from 'react';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';

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
);

export default AddFab;
