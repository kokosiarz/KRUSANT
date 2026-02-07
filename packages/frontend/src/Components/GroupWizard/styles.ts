import { SxProps, Theme } from '@mui/material/styles';

export const groupTemplateFormStyles: Record<string, SxProps<Theme>> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1300,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  container: {
    backgroundColor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    width: '92%',
    maxWidth: 600,
    minHeight: 520,
    height: 'auto',
    p: { xs: 2, sm: 4 },
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    py: 3,
  },
  stepHeader: {
    mb: 4,
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
  },
  stepTitle: {
    mb: 0.5,
  },
  alert: {
    mb: 3,
  },
  content: {
    mb: 4,
    minHeight: 200,
    flex: 1,
    overflowY: 'auto',
    maxHeight: '100%',
    boxSizing: 'border-box',
  },
  buttonColumn: {
    display: 'flex',
    gap: 2,
    flexDirection: 'column',
  },
  secondaryRow: {
    display: 'flex',
    gap: 2,
  },
  primaryButton: {
    py: 1.5,
  },
};

export const stepDot = (isCurrent: boolean, isCompleted: boolean): SxProps<Theme> => ({
  width: isCurrent ? 32 : 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: isCompleted ? 'primary.main' : 'divider',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  opacity: isCompleted ? 1 : 0.4,
});
