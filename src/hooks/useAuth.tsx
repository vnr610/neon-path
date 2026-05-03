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
  isEditor: boolean;
  role: "admin" | "editor" | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [role, setRole] = useState<"admin" | "editor" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Subscribe FIRST (per Supabase guidance) so we never miss an event.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession?.user) {
        setIsAdmin(false);
        setIsEditor(false);
        setRole(null);
        setLoading(false);
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
    const [adminRes, editorRes] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "editor" }),
    ]);
    if (adminRes.error) console.error("[auth] has_role check failed", adminRes.error);
    const admin = Boolean(adminRes.data);
    const editor = Boolean(editorRes.data);
    setIsAdmin(admin);
    setIsEditor(editor);
    setRole(admin ? "admin" : editor ? "editor" : null);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setIsEditor(false);
    setRole(null);
  };

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      isAdmin,
      isEditor,
      role,
      loading,
      signOut,
    }),
    [session, isAdmin, isEditor, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}