import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAuthStore } from "@/stores/auth";

interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
}
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string; role: "admin" | "user" };
}

export const authQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    const user = await api<AuthUser>("/auth/me");
    useAuthStore.getState().setUser(user);
    return user;
  },
  staleTime: Infinity,
  retry: false,
});

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      useAuthStore.getState().setAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api<LoginResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      useAuthStore.getState().setAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSettled: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
    },
  });
}
