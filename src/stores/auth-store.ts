import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  setInitialized: () => {
    set({ isInitialized: true });
  },
}));
