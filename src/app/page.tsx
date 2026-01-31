'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function WelcomePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Auth Mode State
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Please enter your full name');
      return;
    }

    setIsLoggingIn(true);

    try {
      if (isSignUp) {
        // Handle Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              organization: organization || 'Independent'
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
            setMessage('Account created! Please check your email to confirm your registration.');
            setIsLoggingIn(false);
        } else if (data.session) {
            // Auto logged in (if email confirmation is disabled)
            router.push('/dashboard');
        }

      } else {
        // Handle Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth failed', err);
      setError(err.message || 'Authentication failed');
      setIsLoggingIn(false);
    }
  };

  const handleGuestPreview = () => {
    // Guest mode bypasses Supabase Auth and uses LocalStorage (handled by storage.ts)
    setIsLoggingIn(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <main className="max-container flex flex-col lg:flex-row h-screen overflow-hidden bg-background-dark">
      {/* Branded Hero Header */}
      <div className="relative h-[40%] lg:h-full lg:w-1/2 w-full overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Intelligence background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
        
        <div className="absolute bottom-12 left-10 right-10 lg:bottom-24 lg:left-24 lg:right-24 flex flex-col gap-6">
          <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(19,127,236,0.4)] border border-white/20">
            <Icon name="query_stats" className="text-white text-4xl" fill />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl lg:text-7xl font-bold tracking-tighter leading-none">
              Living Policy <br className="hidden lg:block" /> Simulator
            </h1>
            <p className="text-muted-foreground text-sm lg:text-xl leading-relaxed max-w-[420px] font-medium">
              Transforming static public policy documents into interactive, explorable future scenarios using advanced causal reasoning.
            </p>
          </div>
        </div>
      </div>

      {/* Authentication Form Wrapper */}
      <div className="flex-1 flex flex-col overflow-y-auto lg:justify-center bg-[#0a1118]">
        <div className="px-8 py-12 lg:px-24 lg:max-w-[640px] lg:mx-auto w-full flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold lg:text-4xl tracking-tight">
              {isSignUp ? 'Create an account' : 'Sign in to your account'}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {isSignUp ? 'Join to simulate and analyze policy impacts.' : 'Access your simulation projects and reports.'}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Icon name="error" />
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Icon name="check_circle" />
                {message}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="stitch-input h-14"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Organization (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Dept of Commerce" 
                    className="stitch-input h-14"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email address</label>
              <input 
                type="email" 
                placeholder="name@organization.gov" 
                className="stitch-input h-14"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isSignUp ? "Create a password" : "Enter your password"} 
                  className="stitch-input h-14 w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                </button>
              </div>
              {!isSignUp && (
                <button className="text-[10px] font-bold text-primary uppercase tracking-wider text-right mt-1 hover:underline">
                    Forgot password?
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
                onClick={handleAuth}
                disabled={isLoggingIn}
                className={cn(
                "stitch-button-primary h-14 flex items-center justify-center text-lg font-bold shadow-xl shadow-primary/20 active:scale-[0.97]",
                isLoggingIn && "opacity-80 cursor-wait"
                )}
            >
                {isLoggingIn ? (
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isSignUp ? "Creating Account..." : "Authenticating..."}</span>
                </div>
                ) : (isSignUp ? "Sign Up" : "Sign In")}
            </button>

            {!isSignUp && (
                <button 
                onClick={handleGuestPreview}
                disabled={isLoggingIn}
                className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 group"
                >
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Preview as Guest</span>
                <Icon name="arrow_forward" className="text-base text-muted-foreground/60 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                </button>
            )}
          </div>

          <div className="mt-4 flex flex-col items-center gap-6">
            <p className="text-xs text-muted-foreground">
              {isSignUp ? "Already have an account?" : "New to the simulator?"}{" "}
              <button 
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setMessage(null);
                }}
                className="text-primary font-bold hover:underline"
              >
                  {isSignUp ? "Sign In" : "Create an account"}
              </button>
            </p>
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
              <span>Security</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span>Privacy</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span>V2.4.0</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
