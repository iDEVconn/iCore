import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string; role: "admin" | "user" } | null;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; role: "admin" | "user" };
  }) => void;
  setUser: (user: {
    id: string;
    email: string;
    role: "admin" | "user";
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "starter-auth" },
  ),
);
