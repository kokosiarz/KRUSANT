import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';

/**
 * The action cluster in a page header (filter toggles + primary buttons).
 *
 * Every page had rolled its own: Students and Finances each used an inline
 * `sx` flex box with different gaps (and Finances added an extra `ml: 2` to one
 * button, so the spacing inside a single row didn't even match), Groups used a
 * `.header-controls` CSS class, and SimpleCrudPage passed a bare button. The
 * result was buttons at different heights and spacings on every screen.
 *
 * **Sizing is enforced here, not per page.** The controls render small, to match
 * the calendar's own toolbar — which is the one header in the app that isn't
 * ours to restyle, so everything else meets it there. It's done with a nested
 * theme rather than by asking each page to pass `size="small"`, because that is
 * the kind of instruction a new page silently forgets and drifts on. Anything
 * dropped in here comes out the right size, including controls added later.
 *
 * The layout is deliberately the same on a phone as on a desktop: the row wraps
 * when it has to, and the controls keep their natural width rather than
 * stretching edge to edge, so a header reads the same everywhere.
 */
const PageHeaderActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const outerTheme = useTheme();
  const compactTheme = useMemo(
    () =>
      createTheme(outerTheme, {
        components: {
          MuiButton: { defaultProps: { size: 'small' } },
          MuiToggleButton: { defaultProps: { size: 'small' } },
          MuiToggleButtonGroup: { defaultProps: { size: 'small' } },
          MuiIconButton: { defaultProps: { size: 'small' } },
        },
      }),
    [outerTheme]
  );

  return (
    <ThemeProvider theme={compactTheme}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
};

export default PageHeaderActions;
