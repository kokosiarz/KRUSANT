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
      // On a phone these fill the row rather than right-aligning: previously
      // each control wrapped onto its own right-aligned line, so the header ate
      // most of the screen before any data appeared.
      justifyContent: { xs: 'stretch', sm: 'flex-end' },
      width: { xs: '100%', sm: 'auto' },
      '& > *': { flex: { xs: '1 1 auto', sm: '0 0 auto' } },
      '& .MuiToggleButtonGroup-root': { width: { xs: '100%', sm: 'auto' } },
      '& .MuiToggleButtonGroup-root .MuiToggleButton-root': {
        flex: { xs: 1, sm: '0 0 auto' },
      },
    }}
  >
    {children}
  </Box>
);

export default PageHeaderActions;
