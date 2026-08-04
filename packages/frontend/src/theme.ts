import { alpha, createTheme, Theme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

type ColorMode = 'light' | 'dark';

/**
 * Brand accent. KRUSANT is a goldsmithing school, so the bronze carries real
 * meaning here — but it works as an *accent* against neutral surfaces, not as
 * large fills, which is what made the old palette read boutique rather than
 * back-office.
 *
 * Light mode uses a deeper bronze than the original #987d3f: white text on
 * that only reached ~3.9:1, under AA for button labels. This clears 5:1 while
 * staying recognisably the same colour. Dark mode goes the other way — a pale
 * gold, since the accent now has to carry against a near-black surface.
 */
const GOLD = {
  light: { main: '#7d6531', light: '#a8894a', dark: '#5c4a24' },
  dark: { main: '#c9a961', light: '#dcc389', dark: '#9d7f3f' },
};

/** Cool neutrals — the canvas the gold sits on. */
const NEUTRAL = {
  light: {
    canvas: '#f5f6f8',
    surface: '#ffffff',
    border: '#e3e6ea',
    text: '#16191d',
    textMuted: '#5b6470',
  },
  dark: {
    canvas: '#0e1116',
    surface: '#161a21',
    border: '#262c35',
    text: '#e8eaed',
    textMuted: '#9aa4b2',
  },
};

const ACCENTS = {
  light: { info: '#3f6d85', success: '#2e7d52', warning: '#b26a00', error: '#c0392b' },
  dark: { info: '#7fb3cc', success: '#5cbd8a', warning: '#e0a858', error: '#f27166' },
};

/**
 * A restrained shadow ramp. MUI's defaults are heavy and muddy at low
 * elevations; business UIs read crisper with hairline borders doing the
 * separating and shadows reserved for things that genuinely float.
 */
const buildShadows = (mode: ColorMode): Theme['shadows'] => {
  const base = mode === 'light' ? '16, 24, 40' : '0, 0, 0';
  const s = (y: number, blur: number, a1: number, a2: number) =>
    `0 ${y}px ${blur}px -${Math.round(y / 2)}px rgba(${base}, ${a1}), ` +
    `0 ${Math.max(1, Math.round(y / 3))}px ${Math.round(blur / 2)}px -1px rgba(${base}, ${a2})`;

  const ramp = [
    'none',
    s(1, 2, 0.06, 0.04),
    s(2, 4, 0.07, 0.04),
    s(3, 6, 0.08, 0.04),
    s(4, 8, 0.08, 0.05),
    s(6, 12, 0.09, 0.05),
    s(8, 16, 0.1, 0.05),
    s(12, 24, 0.11, 0.06),
    s(16, 32, 0.12, 0.06),
  ];
  // MUI requires exactly 25 entries; saturate the tail at the deepest step.
  return Array.from({ length: 25 }, (_, i) =>
    i < ramp.length ? ramp[i] : ramp[ramp.length - 1],
  ) as unknown as Theme['shadows'];
};

export const createAppTheme = (mode: ColorMode): Theme => {
  const gold = GOLD[mode];
  const n = NEUTRAL[mode];
  const a = ACCENTS[mode];
  const isLight = mode === 'light';
  const headerTint = isLight ? '#fafbfc' : alpha('#ffffff', 0.02);

  return createTheme({
    palette: {
      mode,
      primary: { ...gold, contrastText: isLight ? '#ffffff' : '#1a1508' },
      secondary: {
        main: a.info,
        contrastText: isLight ? '#ffffff' : '#0d1b22',
      },
      success: { main: a.success },
      warning: { main: a.warning },
      error: { main: a.error },
      info: { main: a.info },
      background: { default: n.canvas, paper: n.surface },
      text: { primary: n.text, secondary: n.textMuted },
      divider: n.border,
    },

    shape: { borderRadius: 10 },
    shadows: buildShadows(mode),

    typography: {
      fontFamily:
        "'Inter Variable', 'Inter', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
      // Headings get negative tracking — at display sizes Inter's default
      // spacing looks loose and blog-like rather than considered.
      h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.022em', lineHeight: 1.25 },
      h3: { fontWeight: 650, fontSize: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.3 },
      h4: { fontWeight: 650, fontSize: '1.375rem', letterSpacing: '-0.018em', lineHeight: 1.3 },
      h5: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.012em', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.008em', lineHeight: 1.4 },
      subtitle1: { fontWeight: 600, fontSize: '0.9375rem' },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },
      button: { fontWeight: 600, letterSpacing: 0 },
      caption: { fontSize: '0.75rem', letterSpacing: '0.005em' },
      // Section labels: small, upper, tracked — the one place uppercase earns
      // its keep.
      overline: {
        fontWeight: 700,
        fontSize: '0.6875rem',
        letterSpacing: '0.08em',
        lineHeight: 2,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: n.canvas },
          // Thin neutral scrollbars — chunky default ones are the fastest way
          // to make an app look unfinished.
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(n.textMuted, 0.32),
            borderRadius: 8,
            border: `2px solid ${n.canvas}`,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: alpha(n.textMuted, 0.5),
          },
        },
      },

      // A slab of gold across the top read as dated. The bar is now a surface
      // with a hairline rule; the gold shows up in the wordmark and controls.
      MuiAppBar: {
        defaultProps: { color: 'inherit', elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: n.surface,
            color: n.text,
            borderBottom: `1px solid ${n.border}`,
            backgroundImage: 'none',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: n.border },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          // Hairline border instead of a shadow at rest: crisper, and keeps
          // cards legible against the near-white canvas.
          root: { border: `1px solid ${n.border}`, borderRadius: 12 },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            // SHOUTING BUTTONS is the most dated MUI default there is.
            textTransform: 'none',
            borderRadius: 8,
            paddingInline: 16,
            transition: 'background-color .15s ease, border-color .15s ease',
          },
          sizeSmall: { paddingInline: 12 },
          outlined: { borderColor: n.border },
        },
        // v9 dropped the colour-specific slots (containedPrimary and friends);
        // per-colour styling goes through `variants` now.
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: { '&:hover': { backgroundColor: gold.dark } },
          },
        ],
      },

      MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },

      // Filter toggles sit directly beside Buttons in page headers, so they
      // have to match them: same casing, same weight, and padding tuned so the
      // two controls come out the same height instead of the toggles sitting
      // a few pixels short.
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            paddingBlock: 7,
            paddingInline: 14,
            color: n.textMuted,
            borderColor: n.border,
            '&.Mui-selected': {
              color: gold.main,
              backgroundColor: alpha(gold.main, isLight ? 0.1 : 0.16),
              '&:hover': {
                backgroundColor: alpha(gold.main, isLight ? 0.16 : 0.22),
              },
            },
          },
          sizeSmall: { paddingBlock: 4, paddingInline: 10 },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: { root: { borderRadius: 8 } },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: n.border },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(gold.main, 0.55),
            },
            // A 2px brand ring rather than MUI's default heavy focus outline.
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: gold.main,
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 7 },
          sizeSmall: { fontSize: '0.75rem' },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isLight ? '#242830' : '#2c333d',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 6,
            paddingBlock: 6,
            paddingInline: 10,
          },
          arrow: { color: isLight ? '#242830' : '#2c333d' },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 14, border: `1px solid ${n.border}` },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontSize: '1.125rem', fontWeight: 650, paddingBottom: 8 },
        },
      },
      MuiDialogActions: {
        styleOverrides: { root: { padding: 20, paddingTop: 8, gap: 8 } },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10, border: '1px solid transparent' },
        },
        // Tinted fill plus a matching hairline, rather than MUI's flat pastel
        // block — reads calmer next to the neutral surfaces.
        variants: (['info', 'warning', 'error', 'success'] as const).map(
          (severity) => ({
            props: { variant: 'standard' as const, severity },
            style: {
              backgroundColor: alpha(a[severity], 0.1),
              borderColor: alpha(a[severity], 0.25),
            },
          }),
        ),
      },

      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundImage: 'none', borderColor: n.border },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: n.border },
          head: {
            fontWeight: 650,
            color: n.textMuted,
            backgroundColor: headerTint,
          },
        },
      },

      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${n.border}`,
            borderRadius: 12,
            backgroundColor: n.surface,
            // Figures in a grid should line up; Inter's tabular numerals do it
            // without falling back to a monospace face.
            fontVariantNumeric: 'tabular-nums',
            '--DataGrid-rowBorderColor': n.border,
          },
          // Was a solid gold block with white text. Now a quiet tinted strip
          // that lets the data lead.
          columnHeaders: { borderBottom: `1px solid ${n.border}` },
          columnHeader: {
            backgroundColor: headerTint,
            '&:focus, &:focus-within': { outline: 'none' },
          },
          columnHeaderTitle: {
            fontWeight: 650,
            fontSize: '0.8125rem',
            color: n.textMuted,
            letterSpacing: '0.01em',
          },
          cell: {
            borderColor: n.border,
            '&:focus, &:focus-within': { outline: 'none' },
          },
          row: {
            '&:hover': { backgroundColor: alpha(gold.main, isLight ? 0.05 : 0.08) },
            '&.Mui-selected': {
              backgroundColor: alpha(gold.main, isLight ? 0.1 : 0.14),
              '&:hover': { backgroundColor: alpha(gold.main, isLight ? 0.14 : 0.18) },
            },
          },
          footerContainer: { borderTop: `1px solid ${n.border}` },
          toolbarContainer: { padding: 8, gap: 8 },
        },
      },
    },
  });
};
