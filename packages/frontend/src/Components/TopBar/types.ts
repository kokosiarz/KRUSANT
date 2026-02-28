export type ColorMode = 'light' | 'dark';

export interface TopBarProps {
  mode: ColorMode;
  onToggleTheme: () => void;
}
