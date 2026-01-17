export type ColorMode = 'light' | 'dark';

export interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
  mode: ColorMode;
  onToggleTheme: () => void;
  onPageChange: (page: string) => void;
}
