import { create } from "zustand";

export type Theme = "light" | "dark";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export type AppState = {
  user: User | null;
  theme: Theme;
  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  reset: () => void;
};

const initialState = {
  user: null as User | null,
  theme: "light" as Theme,
};

export const useAppStore = create<AppState>()((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  reset: () => set(initialState),
}));
