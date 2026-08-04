import React from 'react';
import Box from '@mui/material/Box';

/**
 * The action cluster in a page header (filter toggles + primary buttons).
 *
 * Every page had rolled its own: Students and Finances each used an inline
 * `sx` flex box with different gaps (and Finances added an extra `ml: 2` to one
 * button, so the spacing inside a single row didn't even match), Groups used a
 * `.header-controls` CSS class, and SimpleCrudPage passed a bare button. The
 * result was buttons at different heights and spacings on every screen.
 *
 * Anything passed here gets one consistent row. Keep controls at the default
 * (medium) size — the theme sizes ToggleButton to match Button so they line up.
 */
const PageHeaderActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    }}
  >
    {children}
  </Box>
);

export default PageHeaderActions;
