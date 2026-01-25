'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export const Icon = ({ name, className, fill = false }: { name: string, className?: string, fill?: boolean }) => (
  <span 
    className={cn("icon select-none flex-shrink-0 inline-flex items-center justify-center", className, fill && "fill-icon")} 
    style={{ 
      fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
      fontSize: 'inherit',
      lineHeight: 1,
      width: '1em',
      height: '1em'
    }}
  >
    {name}
  </span>
);

export const StatusPill = ({ label, status }: { label: string, status: 'ready' | 'analyzing' | 'archived' | 'error' | 'success' }) => {
  const colors = {
    ready: 'text-green-400 bg-green-400/10 border-green-400/20',
    analyzing: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    archived: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    error: 'text-red-400 bg-red-400/10 border-red-400/20',
    success: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };
  const dotColors = {
    ready: 'bg-green-400',
    analyzing: 'bg-amber-400',
    archived: 'bg-slate-400',
    error: 'bg-red-400',
    success: 'bg-blue-400',
  };
  return (
    <div className={cn("status-pill", colors[status])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[status])} />
      {label}
    </div>
  );
};

export const ProgressBar = ({ progress, label }: { progress: number, label?: string }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && (
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
    )}
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export const SearchBar = ({ placeholder, className, value, onChange }: { placeholder: string, className?: string, value?: string, onChange?: (val: string) => void }) => (
  <div className={cn("relative flex items-center w-full", className)}>
    <Icon name="search" className="absolute left-3 text-muted-foreground text-sm" />
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="stitch-input w-full pl-10 text-sm" 
    />
  </div>
);

export const TopNav = ({ title, showBack = true, rightElement }: { title: string, showBack?: boolean, rightElement?: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="sticky top-0 z-50 h-20 bg-[#0a1118]/80 backdrop-blur-md border-b border-white/5 px-6 lg:px-12 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {showBack && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Icon name="arrow_back" className="text-xl" />
            </button>
          )}
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10 shrink-0">
            <Icon name="query_stats" className="text-white text-2xl" fill />
          </div>
          <h1 className="font-bold text-lg lg:text-xl hidden sm:block tracking-tighter">LPS</h1>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-2 ml-8">
          <TopNavLink href="/dashboard" icon="home" label="Home" active={isActive('/dashboard')} />
          <TopNavLink href="/library" icon="menu_book" label="Library" active={isActive('/library')} />
          <TopNavLink href="/visualization" icon="insert_chart" label="Impact" active={isActive('/visualization')} />
          <TopNavLink href="/settings" icon="settings" label="Settings" active={isActive('/settings')} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
           <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</h2>
        </div>
        <div className="h-6 w-[1px] bg-white/10 hidden md:block mx-4" />
        <div className="flex items-center gap-4">
           {rightElement || (
             <>
               <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white">
                 <Icon name="share" className="text-xl" />
               </button>
               <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 cursor-pointer hover:border-primary transition-colors">
                 <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=137fec&color=fff" alt="User" />
               </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

const TopNavLink = ({ href, icon, label, active }: any) => (
  <Link href={href} className={cn(
    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
    active ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(19,127,236,0.1)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
  )}>
    <Icon name={icon} className="text-xl" fill={active} />
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </Link>
);

export const BottomAction = ({ label, icon, onClick }: { label: string, icon: string, onClick?: () => void }) => (
  <div className="sticky bottom-0 z-50 bg-background-dark/80 backdrop-blur-md border-t border-border p-6">
    <button 
      onClick={onClick}
      className="stitch-button-primary w-full flex items-center justify-center gap-2 py-3.5"
    >
      <Icon name={icon} className="text-xl" />
      <span>{label}</span>
    </button>
  </div>
);

export const SidebarNav = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a1118]/95 backdrop-blur-xl border-t border-white/[0.05] px-8 flex items-center justify-between z-[100] lg:hidden">
      <NavLink href="/dashboard" icon="home" label="Home" active={isActive('/dashboard')} />
      <NavLink href="/library" icon="menu_book" label="Library" active={isActive('/library')} />
      <NavLink href="/visualization" icon="insert_chart" label="Impact" active={isActive('/visualization')} />
      <NavLink href="/settings" icon="settings" label="Settings" active={isActive('/settings')} />
    </nav>
  );
};

const NavLink = ({ href, icon, label, active }: { href: string, icon: string, label: string, active: boolean }) => (
  <Link href={href} className={cn(
    "flex flex-col items-center gap-1 group transition-all relative w-full lg:w-auto",
    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
  )}>
    <Icon name={icon} className="text-2xl" fill={active} />
    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80 group-hover:opacity-100">{label}</span>
    {active && (
      <div className="hidden lg:block absolute -right-[36px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(19,127,236,0.8)]" />
    )}
  </Link>
);
