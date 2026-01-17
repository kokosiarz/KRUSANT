export type ColorMode = 'light' | 'dark';

export interface TopBarProps {
  mode: ColorMode;
  onToggleTheme: () => void;
  onPageChange: (page: string) => void;
}
