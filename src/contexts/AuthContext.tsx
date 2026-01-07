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

  // هنا بنستخدم setLoading من الـ hook عشان نتحكم في حالة التحميل المركزية
  const { validateSessionAndUser, loading, setLoading } = useAuthValidation();
  const { login, adminLogin, signup, logout } = useAuthOperations();

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
              return; // setLoading(false) will happen in finally block if we wanted, but here we redirect out
            }

            // 4. نجيب البيانات الحقيقية من الداتابيز (بما فيها الـ Role الصح)
            const userData = await fetchUserProfile(newSession.user.id, newSession.user.email!);

            // 5. نحدث اليوزر بالبيانات السليمة
            setUser(userData);
            console.log('✅ Profile loaded successfully:', userData.role);

          } catch (err) {
            console.error('❌ Error fetching profile on login:', err);
            // Fallback safety
            setUser(null);
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