import React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type Role = "admin" | "user";

type AuthContextValue = {
  user: User | null;
  role: Role;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const deriveRole = (sessionUser: User | null): Role => {
  const appRoleRaw = sessionUser?.app_metadata as Record<string, unknown> | undefined;
  const userRoleRaw = sessionUser?.user_metadata as Record<string, unknown> | undefined;
  const candidate = [appRoleRaw?.role, userRoleRaw?.role].find(
    (value): value is string => typeof value === "string"
  );
  return candidate?.toLowerCase() === "admin" ? "admin" : "user";
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [role, setRole] = React.useState<Role>("user");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setRole(deriveRole(sessionUser));
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      setRole(deriveRole(authUser));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    setRole("user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, isAdmin: role === "admin", loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
