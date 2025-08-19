import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeAuthError } from '@/utils/authErrors';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/profile`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string, rememberMe: boolean = false) => {
    // Use current origin for redirect to work in all environments
    const redirectUrl = `${window.location.origin}/verify`;
    
    console.log('Attempting signup with:', { email, redirectUrl });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            remember_me: rememberMe
          }
        }
      });
      
      console.log('Signup result:', { data, error });
      
      // Redirect to check-email page on successful signup
      if (!error) {
        // Store email for check-email page
        sessionStorage.setItem('signup-email', email);
        window.location.href = '/check-email';
      }
      
      return { error: error ? sanitizeAuthError(error) : null };
    } catch (catchError) {
      console.error('Signup catch error:', catchError);
      return { error: sanitizeAuthError(catchError) };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: sanitizeAuthError(error) };
      }
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('session-settings', JSON.stringify({ rememberMe: true }));
      }
      
      // Redirect to intended page or profile
      const intendedUrl = sessionStorage.getItem('intended-url');
      if (intendedUrl) {
        sessionStorage.removeItem('intended-url');
        window.location.href = intendedUrl;
      } else {
        window.location.href = '/profile';
      }
      
      return { error: null };
    } catch (catchError) {
      return { error: sanitizeAuthError(catchError) };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?mode=reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      return { error: error ? sanitizeAuthError(error) : null };
    } catch (catchError) {
      return { error: sanitizeAuthError(catchError) };
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    try {
      const emailToUse = email || sessionStorage.getItem('signup-email');
      if (!emailToUse) {
        return { error: { message: 'No email address found. Please sign up again.' } };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`
        }
      });

      return { error: error ? sanitizeAuthError(error) : null };
    } catch (catchError) {
      return { error: sanitizeAuthError(catchError) };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signUpWithMagicLink,
    signIn,
    signOut,
    resetPassword,
    resendVerificationEmail,
  };
};