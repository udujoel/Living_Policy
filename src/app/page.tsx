'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = () => {
    setIsLoggingIn(true);
    // Simulate a brief network delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
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
            <h2 className="text-3xl font-bold lg:text-4xl tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground font-medium">Access your simulation projects and reports.</p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email address</label>
              <input 
                type="email" 
                placeholder="name@organization.gov" 
                className="stitch-input h-14"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className="stitch-input h-14 w-full pr-12"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                </button>
              </div>
              <button className="text-[10px] font-bold text-primary uppercase tracking-wider text-right mt-1 hover:underline">
                Forgot password?
              </button>
            </div>
          </div>

          <button 
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className={cn(
              "stitch-button-primary h-14 flex items-center justify-center text-lg font-bold shadow-xl shadow-primary/20 active:scale-[0.97]",
              isLoggingIn && "opacity-80 cursor-wait"
            )}
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : "Sign In"}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or continue with</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button className="stitch-button-secondary h-14 flex items-center justify-center bg-white/5 border-white/10 hover:bg-white/10">
              <Icon name="person" className="text-2xl" />
            </button>
            <button className="stitch-button-secondary h-14 flex items-center justify-center bg-white/5 border-white/10 hover:bg-white/10">
              <Icon name="shield" className="text-2xl" />
            </button>
            <button className="stitch-button-secondary h-14 flex items-center justify-center bg-white/5 border-white/10 hover:bg-white/10">
              <Icon name="distance" className="text-2xl" />
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center gap-6">
            <p className="text-xs text-muted-foreground">
              New to the simulator? <button className="text-primary font-bold hover:underline">Request access</button>
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
