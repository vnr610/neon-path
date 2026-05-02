import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Subscribe FIRST (per Supabase guidance) so we never miss an event.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession?.user) {
        setIsAdmin(false);
        return;
      }
      // Defer Supabase calls out of the callback to avoid deadlocks.
      setTimeout(() => {
        void checkAdmin(newSession.user.id);
      }, 0);
    });

    // 2. Then read existing session.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        void checkAdmin(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (error) {
      console.error("has_role check failed", error);
      setIsAdmin(false);
      return;
    }
    setIsAdmin(Boolean(data));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      isAdmin,
      loading,
      signOut,
    }),
    [session, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}