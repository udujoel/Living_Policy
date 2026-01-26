'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Icon } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1118] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full opacity-30" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full opacity-30" />

      <div className="w-full max-w-md flex flex-col gap-8 relative z-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 border border-white/10 mb-4">
            <Icon name="query_stats" className="text-white text-4xl" fill />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Living Policy Simulator</h1>
          <p className="text-muted-foreground">
            {mode === 'signin' ? 'Welcome back to your workspace' : 'Create an account to save your simulations'}
          </p>
        </div>

        <div className="stitch-card p-8 bg-card-alt/30 border-white/10 backdrop-blur-xl">
          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
              <div className="relative">
                <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="stitch-input w-full pl-10 py-3 bg-black/20"
                  placeholder="policy.expert@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="stitch-input w-full pl-10 py-3 bg-black/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <Icon name="error" />
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                <Icon name="check_circle" />
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="stitch-button-primary py-3.5 mt-2 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <Icon name="arrow_forward" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                  setMessage(null);
                }}
                className="text-primary hover:underline font-bold"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <Link href="/" className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
          ← Back to Landing Page
        </Link>
      </div>
    </main>
  );
}
