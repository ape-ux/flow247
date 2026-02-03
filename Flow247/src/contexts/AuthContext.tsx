import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut, DEV_MODE, type SupabaseUser } from '@/lib/supabase';
import { syncUserToXano, setXanoToken, getXanoToken, updateXanoUserProfile, type XanoUser } from '@/lib/xano';
import type { Session } from '@supabase/supabase-js';

// Supabase profile row (mirrors the profiles table)
export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  profile_photo_url?: string | null;
  job_title?: string | null;
  department?: string | null;
  timezone?: string | null;
  xano_user_id?: number | null;
  account_id?: number | null;
  tenant_id?: number | null;
  user_type?: string | null;
  employee_role?: string | null;
  user_role_v2?: string | null;
  is_super_admin?: boolean | null;
  status?: string | null;
  auth_provider?: string | null;
  permissions?: Record<string, unknown> | null;
  is_sales_agent?: boolean | null;
  sales_agent_id?: number | null;
  commission_rate?: number | null;
  customer_id?: number | null;
  llm_api_key?: string | null;
  llm_settings?: Record<string, unknown> | null;
  email_settings?: Record<string, unknown> | null;
  workflow_settings?: Record<string, unknown> | null;
  storage_settings?: Record<string, unknown> | null;
  notification_settings?: Record<string, unknown> | null;
  google_id?: string | null;
  google_oauth?: Record<string, unknown> | null;
  invited_by?: number | null;
  invited_at?: string | null;
  last_login?: string | null;
  last_ip?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AuthState {
  user: SupabaseUser | null;
  xanoUser: XanoUser | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  xanoReady: boolean;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Map Xano user data to Supabase profile columns
function xanoToProfile(xanoUser: XanoUser, supabaseId: string): Partial<Profile> {
  return {
    id: supabaseId,
    email: xanoUser.email,
    full_name: xanoUser.name || null,
    first_name: xanoUser.first_name || null,
    last_name: xanoUser.last_name || null,
    phone: xanoUser.phone || null,
    job_title: xanoUser.job_title || null,
    department: xanoUser.department || null,
    timezone: xanoUser.timezone || null,
    profile_photo_url: xanoUser.profile_photo?.url || xanoUser.profile_photo?.path || null,
    xano_user_id: xanoUser.id,
    account_id: xanoUser.account_id || null,
    tenant_id: xanoUser.tenant_id || null,
    user_type: xanoUser.user_type || null,
    employee_role: xanoUser.employee_role || null,
    user_role_v2: xanoUser.user_role_v2 || null,
    role: xanoUser.role || null,
    is_super_admin: xanoUser.is_super_admin || false,
    status: xanoUser.status || 'active',
    auth_provider: xanoUser.auth_provider || 'email',
    permissions: xanoUser.permissions || null,
    is_sales_agent: xanoUser.is_sales_agent || false,
    sales_agent_id: xanoUser.sales_agent_id || 0,
    commission_rate: xanoUser.commission_rate || 0,
    customer_id: xanoUser.customer_id || 0,
    llm_api_key: xanoUser.llm_api_key || null,
    llm_settings: xanoUser.llm_settings || {},
    email_settings: xanoUser.email_settings || {},
    workflow_settings: xanoUser.workflow_settings || {},
    storage_settings: xanoUser.storage_settings || {},
    notification_settings: xanoUser.notification_settings || {},
    google_id: xanoUser.google_id || null,
    google_oauth: xanoUser.google_oauth as Record<string, unknown> || null,
    invited_by: xanoUser.invited_by || null,
    invited_at: xanoUser.invited_at ? new Date(xanoUser.invited_at).toISOString() : null,
    last_login: xanoUser.last_login ? new Date(xanoUser.last_login).toISOString() : null,
    last_ip: xanoUser.last_ip || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    xanoUser: null,
    profile: null,
    session: null,
    isLoading: !DEV_MODE,
    isAuthenticated: false,
    xanoReady: !!getXanoToken(),
  });

  // Helper: race a promise against a timeout
  const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
    Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);

  // Read Supabase profile (fast, always works if user exists)
  const readSupabaseProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      return data as Profile | null;
    } catch {
      return null;
    }
  };

  // Sync user to Xano, then upsert Xano data into Supabase profiles
  const syncToXano = async (supabaseUser: SupabaseUser): Promise<{
    user: XanoUser | null;
    authToken: string | null;
    profile: Profile | null;
  }> => {
    if (!supabaseUser || DEV_MODE) return { user: null, authToken: null, profile: null };

    // Always read Supabase profile first (fast) so we have data even if Xano is slow
    const existingProfile = await readSupabaseProfile(supabaseUser.id);

    try {
      // 1. Sync to Xano with 8s timeout
      const xanoResult = await withTimeout(
        syncUserToXano({
          id: supabaseUser.id,
          email: supabaseUser.email,
          user_metadata: supabaseUser.user_metadata,
        }),
        8000,
        { error: 'Xano sync timed out' } as { data?: any; error?: string }
      );

      if (xanoResult.error) {
        console.warn('[Auth] Xano sync API failed:', xanoResult.error);
        return { user: null, authToken: null, profile: existingProfile };
      }

      const responseAny = xanoResult.data as any;
      const xanoUser: XanoUser | null = responseAny?.user || xanoResult.data;
      const authToken: string | null = responseAny?.authToken || null;

      // 2. Sync Xano data into Supabase profiles table (best-effort, don't block token/user)
      let profile: Profile | null = existingProfile;
      if (xanoUser) {
        try {
          const profileData = xanoToProfile(xanoUser, supabaseUser.id);

          if (existingProfile) {
            const { id: _id, ...updateData } = profileData;
            const { data: updated, error: updateError } = await supabase
              .from('profiles')
              .update({ ...updateData, updated_at: new Date().toISOString() })
              .eq('id', supabaseUser.id)
              .select()
              .single();

            if (updateError) {
              console.warn('[Auth] Supabase profile update failed:', updateError.message);
            } else {
              profile = updated as Profile;
            }
          } else {
            const { data: inserted, error: insertError } = await supabase
              .from('profiles')
              .insert({ ...profileData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
              .select()
              .single();

            if (insertError) {
              console.warn('[Auth] Supabase profile insert failed:', insertError.message);
              profile = await readSupabaseProfile(supabaseUser.id);
            } else {
              profile = inserted as Profile;
            }
          }
        } catch (profileError) {
          console.warn('[Auth] Supabase profile sync error (non-fatal):', profileError);
        }
      }

      return { user: xanoUser, authToken, profile };
    } catch (error) {
      console.error('Error syncing to Xano:', error);
      return { user: null, authToken: null, profile: existingProfile };
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (DEV_MODE) {
      console.info('[Flow247] DEV MODE: Auth disabled for UI preview');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let initialSessionHandled = false;
    let authInProgress = false;
    let authenticatedUserId: string | null = null;

    // Helper: authenticate user, read profile, then sync Xano in background
    const authenticateUser = async (session: Session) => {
      if (authInProgress) return;
      // Skip if we already fully authenticated this user
      if (authenticatedUserId === session.user.id) {
        setState(prev => ({ ...prev, session }));
        return;
      }
      authInProgress = true;
      const user = session.user;
      const hasExistingToken = !!getXanoToken();

      // 1. Read Supabase profile FIRST (fast, has permissions like is_super_admin)
      //    Use a short timeout so we don't block forever
      const quickProfile = await withTimeout(readSupabaseProfile(user.id), 3000, null);
      console.log('[Auth] Quick profile from Supabase:', { found: !!quickProfile, name: quickProfile?.full_name, isSuperAdmin: quickProfile?.is_super_admin });

      // 2. Set authenticated with profile so permissions (admin panel, etc.) work immediately
      setState({
        user,
        xanoUser: null,
        profile: quickProfile,
        session,
        isLoading: false,
        isAuthenticated: true,
        xanoReady: hasExistingToken,
      });

      // 3. Sync to Xano in background — sets token and xanoReady when done
      try {
        console.log('[Auth] Starting Xano sync for:', user.email);

        // Call Xano /user/sync directly (don't go through syncToXano which also
        // reads Supabase profile and writes back — that can hang/block)
        const xanoResult = await withTimeout(
          syncUserToXano({
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
          }),
          8000,
          { error: 'Xano sync timed out' } as { data?: any; error?: string }
        );

        if (xanoResult.error) {
          console.warn('[Auth] Xano sync failed:', xanoResult.error);
          setState(prev => ({ ...prev, xanoReady: true }));
          return;
        }

        const responseAny = xanoResult.data as any;
        const syncedUser: XanoUser | null = responseAny?.user || xanoResult.data;
        const authToken: string | null = responseAny?.authToken || null;
        console.log('[Auth] Xano sync OK:', { name: syncedUser?.name, isSuperAdmin: syncedUser?.is_super_admin, hasToken: !!authToken });

        // Set token FIRST so subsequent API calls work
        if (authToken) setXanoToken(authToken);

        // Build a profile from the Xano user data for immediate display
        const xanoProfile: Partial<Profile> | null = syncedUser ? xanoToProfile(syncedUser, user.id) : null;

        // Update state IMMEDIATELY — don't wait for Supabase write
        setState(prev => ({
          ...prev,
          xanoUser: syncedUser,
          xanoReady: true,
          profile: xanoProfile ? { ...prev.profile, ...xanoProfile } as Profile : prev.profile,
        }));
        authenticatedUserId = user.id;

        // Best-effort: sync Xano data back to Supabase profiles table (non-blocking)
        if (syncedUser && quickProfile) {
          const { id: _id, ...updateData } = xanoProfile || {};
          supabase
            .from('profiles')
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .then(({ error: upErr }) => {
              if (upErr) console.warn('[Auth] Supabase profile write failed (non-blocking):', upErr.message);
            });
        } else if (syncedUser && !quickProfile && xanoProfile) {
          supabase
            .from('profiles')
            .upsert({ ...xanoProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'id' })
            .then(({ error: insErr }) => {
              if (insErr) console.warn('[Auth] Supabase profile upsert failed (non-blocking):', insErr.message);
            });
        }
      } catch (e) {
        console.warn('Background Xano sync failed:', e);
        setState(prev => ({ ...prev, xanoReady: true }));
      } finally {
        authInProgress = false;
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          initialSessionHandled = true;
          await authenticateUser(session);
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && initialSessionHandled) {
        initialSessionHandled = false;
        if (session) setState(prev => ({ ...prev, session }));
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        await authenticateUser(session);
      } else if (event === 'SIGNED_OUT') {
        authenticatedUserId = null;
        setXanoToken(null);
        setState({
          user: null,
          xanoUser: null,
          profile: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          xanoReady: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setState(prev => ({ ...prev, session }));
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      const { error } = await signInWithGoogle();
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Google sign in failed') };
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await signInWithEmail(email, password);
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await signUpWithEmail(email, password, { name });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
      setXanoToken(null);
      setState({
        user: null,
        xanoUser: null,
        profile: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        xanoReady: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Update Supabase profile + sync key fields to Xano
  const handleUpdateProfile = async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!state.user) return { error: 'Not authenticated' };

    try {
      // 1. Update Supabase profiles table
      const { data: updatedProfile, error: sbError } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', state.user.id)
        .select()
        .single();

      if (sbError) return { error: sbError.message };

      // 2. Sync editable fields to Xano (best-effort, don't block on failure)
      try {
        await updateXanoUserProfile({
          first_name: updates.first_name ?? undefined,
          last_name: updates.last_name ?? undefined,
          phone: updates.phone ?? undefined,
          job_title: updates.job_title ?? undefined,
          department: updates.department ?? undefined,
          timezone: updates.timezone ?? undefined,
          llm_api_key: updates.llm_api_key ?? undefined,
          notification_settings: updates.notification_settings ?? undefined,
          email_settings: updates.email_settings ?? undefined,
          workflow_settings: updates.workflow_settings ?? undefined,
          storage_settings: updates.storage_settings ?? undefined,
          llm_settings: updates.llm_settings ?? undefined,
        } as any);
      } catch (xanoError) {
        console.warn('Xano sync failed (non-critical):', xanoError);
      }

      setState(prev => ({ ...prev, profile: updatedProfile as Profile }));
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Update failed' };
    }
  };

  const refreshUser = async () => {
    if (!state.user || DEV_MODE) return;

    const { user: xanoUser, authToken, profile } = await syncToXano(state.user);
    if (authToken) setXanoToken(authToken);
    setState(prev => ({ ...prev, xanoUser, profile }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signOut: handleSignOut,
        refreshUser,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
