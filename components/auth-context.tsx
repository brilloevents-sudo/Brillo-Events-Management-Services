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
      const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setUser(data.user);
        if (typeof localStorage !== "undefined") {
          try {
            localStorage.setItem("brillo_auth_session_v3", JSON.stringify(data.user));
          } catch {}
        }
        return data.user as SessionUser;
      }
      // Fallback to localStorage session for static cPanel / offline modes
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem("brillo_auth_session_v3");
        if (raw) {
          try {
            const fallbackUser = JSON.parse(raw);
            if (fallbackUser && fallbackUser.email && fallbackUser.role) {
              setUser(fallbackUser);
              return fallbackUser as SessionUser;
            }
          } catch {}
        }
      }
      setUser(null);
      return null;
    } catch {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem("brillo_auth_session_v3");
        if (raw) {
          try {
            const fallbackUser = JSON.parse(raw);
            if (fallbackUser && fallbackUser.email && fallbackUser.role) {
              setUser(fallbackUser);
              return fallbackUser as SessionUser;
            }
          } catch {}
        }
      }
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
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem("brillo_auth_session_v3");
      } catch {}
    }
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
