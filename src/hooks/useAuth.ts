import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../lib/api.fetcher";

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
}

interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
}

export const authKeys = {
  status: ["auth", "status"] as const,
};

async function fetchAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> {
  const res = await fetch(`${API_BASE_URL}/api/auth/status`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Auth check failed");
  const data: AuthStatusResponse = await res.json();

  if (data.authenticated && data.user) {
    return { isAuthenticated: true, user: data.user };
  }

  return { isAuthenticated: false, user: null };
}

async function postLogout(): Promise<void> {
  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export function useAuth() {
  const query = useQuery({
    queryKey: authKeys.status,
    queryFn: fetchAuthStatus,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    user: query.data?.user ?? null,
    isAuthenticated: query.data?.isAuthenticated ?? false,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSettled: () => {
      queryClient.setQueryData(authKeys.status, {
        isAuthenticated: false,
        user: null,
      });
      queryClient.removeQueries({ queryKey: authKeys.status });
    },
  });
}
