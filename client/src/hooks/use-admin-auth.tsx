import { createContext, ReactNode, useContext, useState } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { AdminUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";

type AdminAuthContextType = {
  user: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AdminUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export type LoginData = {
  username: string;
  password: string;
};

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiRequest("POST", "/api/admin/login", credentials);
        const userData = await res.json();
        setUser(userData);
        queryClient.setQueryData(["/api/admin/user"], userData);
        return userData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Login failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest("POST", "/api/admin/logout");
      } finally {
        setUser(null);
        queryClient.setQueryData(["/api/admin/user"], null);
      }
    },
  });

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}