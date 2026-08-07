import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabaseLazy';
import { Profile, UserRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    // L'SDK Supabase viene caricato qui, dopo il primo render: non deve stare
    // nel bundle iniziale delle pagine pubbliche (vedi lib/supabaseLazy).
    let unsubscribe: (() => void) | undefined;
    let annullato = false;

    getSupabase()
      .then((supabase) => {
        if (annullato) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              setTimeout(() => {
                fetchProfile(session.user.id);
              }, 0);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }
        );
        unsubscribe = () => subscription.unsubscribe();

        return supabase.auth.getSession().then(({ data: { session } }) => {
          if (annullato) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        // Se l'SDK non si carica trattiamo l'utente come non autenticato:
        // il sito pubblico resta navigabile, le rotte protette rimandano al login.
        if (!annullato) setLoading(false);
      });

    return () => {
      annullato = true;
      unsubscribe?.();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isRole = (role: UserRole) => profile?.ruolo === role;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signOut,
      isRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
