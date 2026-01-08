import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser, AuthContextType } from '@/types/auth';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { fetchUserProfile } from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const isInitialized = useRef(false);
  const lastFocusCheck = useRef<number>(0);
  
  // Ref to store pending auth state change resolvers
  const authStateResolvers = useRef<{
    resolve: (user: AuthUser | null) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // هنا بنستخدم setLoading من الـ hook عشان نتحكم في حالة التحميل المركزية
  const { validateSessionAndUser, loading, setLoading } = useAuthValidation();
  const { login: baseLogin, adminLogin: baseAdminLogin, signup, logout: baseLogout } = useAuthOperations();

  const checkAuthStatus = useCallback(async () => {
    await validateSessionAndUser(setSession, setUser);
  }, [validateSessionAndUser]);

  // Handle tab focus/visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastFocusCheck.current < 5000) return;
        lastFocusCheck.current = now;

        console.log('👁️ Tab became visible, checking session...');
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (error) return;

          if (currentSession && currentSession.user) {
            if (!session || session.access_token !== currentSession.access_token) {
              console.log('🔄 Refreshing session state after tab focus');
              setSession(currentSession);
              // Background refresh is fine here because the user is ALREADY logged in/viewing the page
              try {
                const userData = await fetchUserProfile(currentSession.user.id, currentSession.user.email!);
                setUser(userData);
              } catch (err) {
                console.warn('⚠️ Could not refresh profile on focus:', err);
              }
            }
          } else if (session) {
            console.log('🚪 Session expired while tab was hidden');
            setSession(null);
            setUser(null);
          }
        } catch (err) {
          console.error('❌ Error during focus check:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('🚀 Initializing auth system...');

    // 1. Setup Listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔔 Auth state changed:', event);

        // --- حالة الخروج ---
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setLoading(false);
          // Resolve any pending logout promise
          if (authStateResolvers.current) {
            authStateResolvers.current.resolve(null);
            authStateResolvers.current = null;
          }
          return;
        }

        // --- حالة الدخول (الحل هنا) ---
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
          console.log('🔐 User signed in, fetching FULL profile...');

          // 1. نحدث السيشن فوراً
          setSession(newSession);

          // 2. نخلي اللودينج شغال عشان الراوتر يستنى
          setLoading(true);

          try {
            // 3. نتأكد إن الحساب مش محظور الأول
            const { data: canAuth } = await supabase.rpc('can_user_authenticate', {
              _user_id: newSession.user.id
            });

            if (canAuth === false) {
              console.warn('🚫 Banned user detected');
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              toast.error('تم حظر حسابك. تم تسجيل الخروج تلقائياً');
              // Reject pending promise for banned user
              if (authStateResolvers.current) {
                authStateResolvers.current.reject(new Error('User is banned'));
                authStateResolvers.current = null;
              }
              return;
            }

            // 4. نجيب البيانات الحقيقية من الداتابيز (بما فيها الـ Role الصح)
            const userData = await fetchUserProfile(newSession.user.id, newSession.user.email!);

            // 5. نحدث اليوزر بالبيانات السليمة
            setUser(userData);
            console.log('✅ Profile loaded successfully:', userData.role);
            
            // Resolve pending login promise with user data
            if (authStateResolvers.current) {
              authStateResolvers.current.resolve(userData);
              authStateResolvers.current = null;
            }

          } catch (err) {
            console.error('❌ Error fetching profile on login:', err);
            // Fallback safety
            setUser(null);
            // Reject pending promise on error
            if (authStateResolvers.current) {
              authStateResolvers.current.reject(err instanceof Error ? err : new Error('Failed to fetch profile'));
              authStateResolvers.current = null;
            }
          } finally {
            // 6. دلوقتي بس نقول للتطبيق "خلاص حملنا"
            setLoading(false);
          }
        } else if (event === 'USER_UPDATED') {
          setSession(newSession);
        }
      }
    );

    // 2. Initial Load
    const initializeAuth = async () => {
      try {
        await validateSessionAndUser(setSession, setUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Remove dependencies to run once

  // Wrapper login function that waits for auth state to be fully updated
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Create a promise that will be resolved when onAuthStateChange completes
    const authStatePromise = new Promise<AuthUser | null>((resolve, reject) => {
      authStateResolvers.current = { resolve, reject };
    });

    try {
      const success = await baseLogin(email, password);
      if (!success) {
        // Clear the resolver if login failed at Supabase level
        authStateResolvers.current = null;
        return false;
      }

      // Wait for the auth state change to complete (profile fetch, etc.)
      const userData = await Promise.race([
        authStatePromise,
        // Timeout after 15 seconds
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Auth state update timeout')), 15000)
        )
      ]);

      return userData !== null;
    } catch (error) {
      console.error('❌ Login error:', error);
      authStateResolvers.current = null;
      return false;
    }
  }, [baseLogin]);

  // Wrapper adminLogin function that waits for auth state to be fully updated
  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Create a promise that will be resolved when onAuthStateChange completes
    const authStatePromise = new Promise<AuthUser | null>((resolve, reject) => {
      authStateResolvers.current = { resolve, reject };
    });

    try {
      const success = await baseAdminLogin(email, password);
      if (!success) {
        // Clear the resolver if login failed at Supabase level
        authStateResolvers.current = null;
        return false;
      }

      // Wait for the auth state change to complete (profile fetch, etc.)
      const userData = await Promise.race([
        authStatePromise,
        // Timeout after 15 seconds
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Auth state update timeout')), 15000)
        )
      ]);

      return userData !== null;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      authStateResolvers.current = null;
      return false;
    }
  }, [baseAdminLogin]);

  // Wrapper logout function that waits for auth state to be fully updated
  const logout = useCallback(async (): Promise<void> => {
    // Create a promise that will be resolved when onAuthStateChange completes
    const authStatePromise = new Promise<AuthUser | null>((resolve) => {
      authStateResolvers.current = { resolve, reject: () => resolve(null) };
    });

    try {
      await baseLogout();

      // Wait for the auth state change to complete
      await Promise.race([
        authStatePromise,
        // Timeout after 5 seconds for logout
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
      ]);
    } catch (error) {
      console.error('❌ Logout error:', error);
      authStateResolvers.current = null;
      // Force clear state on error
      setUser(null);
      setSession(null);
    }
  }, [baseLogout]);

  const contextValue: AuthContextType = {
    user,
    session,
    login,
    adminLogin,
    signup,
    logout,
    loading,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isVendor: user?.role === 'VENDOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};