"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiJson } from "../lib/api";

type UserRole =
  | "USER"
  | "ADMIN";

type User = {
  id: string;
  username: string;
  email: string;

  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;

  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType | null>(
    null,
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refreshUser() {
    const storedToken =
      localStorage.getItem(
        "gamehub_token",
      );

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const data =
        await apiJson<User>(
          "/auth/me",
          {
            token: storedToken,
          },
        );

      setUser(data);

      localStorage.setItem(
        "gamehub_user",
        JSON.stringify(data),
      );
    } catch {
      localStorage.removeItem(
        "gamehub_token",
      );

      localStorage.removeItem(
        "gamehub_user",
      );

      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  function logout() {
    localStorage.removeItem(
      "gamehub_token",
    );

    localStorage.removeItem(
      "gamehub_user",
    );

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider.",
    );
  }

  return context;
}