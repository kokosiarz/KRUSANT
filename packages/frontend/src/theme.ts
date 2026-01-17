import { createTheme, Theme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

type ColorMode = 'light' | 'dark';

export const createAppTheme = (mode: ColorMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#987d3f' : '#987d3f',
        // main: mode === 'light' ? '#9b6e23' : '#9b6e23',
      },
      secondary: {
        main: '#6ba5c4',
      },
      background: {
        default: mode === 'light' ? '#f6e8ea' : '#0f0f0f',
        paper: mode === 'light' ? '#fff7f0' : '#1c1c1c',
      },
      text: {
        primary: mode === 'light' ? '#1c1c1c' : '#f3f4f6',
        secondary: mode === 'light' ? '#4b5563' : '#cbd5e1',
      },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily:
        "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic Pro', 'Noto Sans JP', sans-serif",
    },
    components: {
      MuiDataGrid: {
        styleOverrides: {
          columnHeaders: {
            backgroundColor: '#987d3f',
            color: '#fff',
            fontWeight: 700,
          },
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1c1c1c',
          },
        },
      },
    },
  });
