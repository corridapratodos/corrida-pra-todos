import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlanId, WorkoutLog, WeightEntry } from '@/types';
import { supabase } from '@/supabaseClient';
import { Session, AuthError } from '@supabase/supabase-js';

interface SignUpData {
  email: string;
  name: string;
  dob: string;
  sex: 'male' | 'female' | 'other';
  height: number;
  initialWeight: number;
  password?: string; // Optional for OAuth
}

interface SignInData {
    email: string;
    password?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (data: SignInData) => Promise<{ error: AuthError | null }>;
  signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  selectPlan: (planId: PlanId) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  getWorkoutLogs: () => Promise<WorkoutLog[]>;
  addWorkoutLog: (log: WorkoutLog) => Promise<void>;
  getWeightEntries: () => Promise<WeightEntry[]>;
  addWeightEntry: (entry: WeightEntry) => Promise<void>;
  getAllUsers: () => Promise<User[]>; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setLoading(true);
        if (session?.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setUser(profile ? { ...profile, email: session.user.email ?? '' } as User : null);
        } else {
            setUser(null);
        }
        setSession(session);
        setLoading(false);
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
             supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
                .then(({ data: profile }) => {
                    setUser(profile ? { ...profile, email: session.user.email ?? '' } as User : null);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async ({ email, password }: SignInData) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password: password! });
      return { error };
  };

  const signUp = async ({ email, password, name, dob, sex, height, initialWeight }: SignUpData) => {
      const { data: authData, error } = await supabase.auth.signUp({ email, password: password! });

      if (error) return { error };

      if (authData.user) {
          // Converte a data de nascimento de DD/MM/YYYY para YYYY-MM-DD
          const [day, month, year] = dob.split('/');
          const isoDob = `${year}-${month}-${day}`;

          const { error: profileError } = await supabase.from('profiles').insert({
              id: authData.user.id,
              name,
              dob: isoDob, // Usa o formato ISO
              sex,
              height,
          });
          if (profileError) return { error: profileError as unknown as AuthError };

          const { error: weightError } = await supabase.from('weight_entries').insert({
              user_id: authData.user.id,
              date: new Date().toISOString(),
              weight: initialWeight,
          });
          if (weightError) return { error: weightError as unknown as AuthError };

          // Manually fetch and set user since onAuthStateChange might not be fast enough
          setUser({ id: authData.user.id, email, name, dob, sex, height, currentPlanId: null, planStartDate: null });
      }
      
      return { error: null };
  };
  
  const signInWithGoogle = async () => {
      await supabase.auth.signInWithOAuth({
          provider: 'google',
      });
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    if (data) setUser({ ...user, ...data });
  };

  const selectPlan = async (planId: PlanId) => {
    if (!user) return;
    const update = { currentPlanId: planId, planStartDate: new Date().toISOString() };
    await updateUser(update);
  };

  const getWorkoutLogs = async (): Promise<WorkoutLog[]> => {
    if (!user) return [];
    const { data, error } = await supabase.from('workout_logs').select('*').eq('user_id', user.id);
    if (error) throw error;
    return data || [];
  };

  const addWorkoutLog = async (log: Omit<WorkoutLog, 'user_id'>) => {
    if (!user) return;
    const { error } = await supabase.from('workout_logs').upsert({ ...log, user_id: user.id }, { onConflict: 'user_id,date' });
    if (error) throw error;
  };

  const getWeightEntries = async (): Promise<WeightEntry[]> => {
    if (!user) return [];
    const { data, error } = await supabase.from('weight_entries').select('date, weight').eq('user_id', user.id).order('date');
    if (error) throw error;
    return data || [];
  };

  const addWeightEntry = async (entry: Omit<WeightEntry, 'user_id'>) => {
    if (!user) return;
    const { error } = await supabase.from('weight_entries').insert({ ...entry, user_id: user.id });
    if (error) throw error;
  };

  const getAllUsers = async (): Promise<User[]> => {
      // Assumes RLS policy allows admins to read profiles
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data || [];
  }

  const value = { user, session, loading, signInWithPassword, signUp, signInWithGoogle, logout, selectPlan, updateUser, getWorkoutLogs, addWorkoutLog, getWeightEntries, addWeightEntry, getAllUsers };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
