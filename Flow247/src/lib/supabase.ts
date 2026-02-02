import { createClient } from '@supabase/supabase-js';

// DEV MODE: Use placeholder values for UI preview
const DEV_MODE = !import.meta.env.VITE_SUPABASE_URL;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (DEV_MODE) {
  console.info('[Flow247] Running in DEV MODE - Supabase disabled for UI preview');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: !DEV_MODE,
    persistSession: !DEV_MODE,
    detectSessionInUrl: !DEV_MODE,
    storage: localStorage,
  },
});

// Auth helpers - return mock data in DEV_MODE
export const signInWithGoogle = async () => {
  if (DEV_MODE) {
    console.info('[Flow247] DEV MODE: Google sign in disabled');
    return { data: null, error: { message: 'Dev mode - configure Supabase to enable auth' } };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  if (DEV_MODE) {
    console.info('[Flow247] DEV MODE: Email sign in disabled');
    return { data: null, error: { message: 'Dev mode - configure Supabase to enable auth' } };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata?: { name?: string }) => {
  if (DEV_MODE) {
    console.info('[Flow247] DEV MODE: Email sign up disabled');
    return { data: null, error: { message: 'Dev mode - configure Supabase to enable auth' } };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  if (DEV_MODE) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (DEV_MODE) {
    return { user: null, error: null };
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  if (DEV_MODE) {
    return { session: null, error: null };
  }
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Profile helpers
export const getProfile = async (userId: string) => {
  if (DEV_MODE) {
    return { data: null, error: null };
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Record<string, unknown>) => {
  if (DEV_MODE) {
    return { data: null, error: null };
  }
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  return { data, error };
};

export type SupabaseUser = Awaited<ReturnType<typeof getCurrentUser>>['user'];
export type SupabaseSession = Awaited<ReturnType<typeof getCurrentSession>>['session'];

// Export DEV_MODE for other modules
export { DEV_MODE };
