import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthState {
  readonly user: User | null;
  readonly session: Session | null;
  readonly loading: boolean;
}

interface AuthContextValue extends AuthState {
  readonly signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  readonly signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  readonly signOut: () => Promise<void>;
  readonly isDemo: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER = {
  id: "demo",
  email: "demo@ironwatch.local",
} as User;

const INITIAL_STATE: AuthState = {
  user: null,
  session: null,
  loading: true,
};

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ user: DEMO_USER, session: null, loading: false });
      return;
    }

    supabase!.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setState({ user: DEMO_USER, session: null, loading: false });
      return { error: null };
    }
    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase!.auth.signUp({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase!.auth.signOut();
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    isDemo: !isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
