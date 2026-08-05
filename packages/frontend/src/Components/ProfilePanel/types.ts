export type ColorMode = 'light' | 'dark';

export interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  mode: ColorMode;
  onToggleTheme: () => void;
}
