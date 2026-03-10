"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  tenant_id: string | null;
  name: string;
  email: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  city: string;
  onboarding_completed: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  restaurantName?: string;
  tenantId?: string;
  plan?: string;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: { restaurantName: string; foodCategory: string; city: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapToUser(profile: Profile, tenant: Tenant | null): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    restaurantName: tenant?.name,
    tenantId: tenant?.id,
    plan: tenant?.plan,
    onboardingCompleted: tenant?.onboarding_completed ?? false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    // Buscar profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (!profile) {
      setUser(null);
      return;
    }

    // Buscar tenant se existir
    let tenant: Tenant | null = null;
    if (profile.tenant_id) {
      const { data } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", profile.tenant_id)
        .single();
      tenant = data;
    }

    setUser(mapToUser(profile, tenant));
  }, []);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    router.push("/");
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    router.push("/onboarding");
  }, [router]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }, [router]);

  const completeOnboarding = useCallback(async (data: { restaurantName: string; foodCategory: string; city: string }) => {
    if (!user) return;

    // Chamar API do servidor (usa service role, ignora RLS)
    const res = await fetch("/api/trpc/onboarding.completeOnboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ json: data }),
    });

    const result = await res.json();
    if (result.error) throw new Error(result.error.message);

    const { tenantId, restaurantName } = result.result.data.json;

    setUser({
      ...user,
      restaurantName,
      tenantId,
      onboardingCompleted: true,
    });

    router.push("/");
  }, [user, router]);

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
