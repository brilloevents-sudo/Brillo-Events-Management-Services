"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  AppRole,
  getPermissionsForRole,
  RolePermissions,
  SessionUser,
} from "@/lib/auth-shared";

interface AuthContextValue {
  user: SessionUser | null;
  role: AppRole | null;
  permissions: RolePermissions;
  loading: boolean;
  refreshSession: () => Promise<SessionUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  permissions: getPermissionsForRole(null),
  loading: true,
  refreshSession: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<SessionUser | null> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setUser(data.user);
        return data.user as SessionUser;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const role = user?.role || null;
  const permissions = getPermissionsForRole(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        loading,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
