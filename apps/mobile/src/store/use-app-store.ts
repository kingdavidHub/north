import { create } from "zustand";

export type Theme = "light" | "dark";

export type AppState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  reset: () => void;
};

const initialState = {
  theme: "light" as Theme,
};

export const useAppStore = create<AppState>()((set) => ({
  ...initialState,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  reset: () => set(initialState),
}));
