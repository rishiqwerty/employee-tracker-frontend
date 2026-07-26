import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorTheme = 'slate' | 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';

interface ThemeState {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorTheme: 'slate',
      setColorTheme: (theme: ColorTheme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'slate') {
            document.documentElement.removeAttribute('data-color-theme');
          } else {
            document.documentElement.setAttribute('data-color-theme', theme);
          }
        }
        set({ colorTheme: theme });
      },
    }),
    {
      name: 'color-accent-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          if (state.colorTheme === 'slate') {
            document.documentElement.removeAttribute('data-color-theme');
          } else {
            document.documentElement.setAttribute('data-color-theme', state.colorTheme);
          }
        }
      },
    }
  )
);
