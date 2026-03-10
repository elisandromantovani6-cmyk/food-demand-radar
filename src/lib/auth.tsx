"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  restaurantName?: string;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: { restaurantName: string; foodCategory: string; city: string }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "fdr_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const persistUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // Demo mode - aceita qualquer credencial
    const u: User = {
      id: "demo-user-1",
      name: email.split("@")[0],
      email,
      restaurantName: "Minha Pizzaria",
      onboardingCompleted: true,
    };
    persistUser(u);
    router.push("/");
  }, [persistUser, router]);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    const u: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      onboardingCompleted: false,
    };
    persistUser(u);
    router.push("/onboarding");
  }, [persistUser, router]);

  const logout = useCallback(() => {
    persistUser(null);
    router.push("/login");
  }, [persistUser, router]);

  const completeOnboarding = useCallback((data: { restaurantName: string; foodCategory: string; city: string }) => {
    if (!user) return;
    const updated = { ...user, restaurantName: data.restaurantName, onboardingCompleted: true };
    persistUser(updated);
    router.push("/");
  }, [user, persistUser, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
