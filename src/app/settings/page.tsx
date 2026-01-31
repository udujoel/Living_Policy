'use client';

import React, { useState } from 'react';
import { Icon, TopNav, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleFixCors = async () => {
    try {
        if (!confirm("This will update Cloudflare R2 CORS settings. Continue?")) return;
        const res = await fetch('/api/admin/fix-cors');
        const data = await res.json();
        if (data.success) {
            alert("Success: " + data.message);
        } else {
            alert("Error: " + data.error);
        }
    } catch (e) {
        alert("Failed to call admin API");
    }
  };

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0">
      <TopNav title="Settings" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Sidebar: Navigation */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col gap-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Settings</h2>
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold text-left border border-primary/20">General</button>
            <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-bold text-left text-muted-foreground">Security</button>
            <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-bold text-left text-muted-foreground">Team</button>
            <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-bold text-left text-muted-foreground">Billing</button>
          </nav>
          
          <div className="mt-auto hidden lg:block">
            <button 
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className={cn(
                "w-full stitch-card p-4 border-red-500/20 bg-red-500/5 flex items-center justify-between text-red-400 group hover:bg-red-500/10 transition-colors",
                isLoggingOut && "opacity-50 cursor-wait"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon name={isLoggingOut ? "sync" : "logout"} className={cn("text-xl", isLoggingOut && "animate-spin")} />
                <span className="text-xs font-bold">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-4xl mx-auto flex flex-col gap-12 pb-32 lg:pb-0">
            {/* Profile Info */}
            <div className="flex items-center gap-6 p-2">
              <div className="relative">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                  <Icon name="person" className="text-4xl lg:text-5xl text-white" fill />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-card-alt border border-white/10 rounded-lg flex items-center justify-center shadow-xl hover:bg-card transition-colors">
                  <Icon name="edit" className="text-sm" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-3xl font-bold">Alex Rivera</h2>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium uppercase tracking-widest">Lead Policy Analyst</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dept of Energy • Online</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsSection title="Workspace & Roles">
                <SettingsItem icon="dashboard" title="Organization Profile" desc="Manage branding and core domains." />
                <SettingsItem icon="shield" title="User Permissions" desc="Roles, access tokens, and SSO." />
              </SettingsSection>

              <SettingsSection title="API & Data Integrations">
                <SettingsItem icon="distance" title="OpenRouter Connection" desc="Gemini 3 Pro / Flash keys." />
                <SettingsItem icon="query_stats" title="External GIS Feeds" desc="Mapbox and ESRI integration." />
              </SettingsSection>
            </div>

            <SettingsSection title="Storage & Maintenance">
                <button onClick={handleFixCors} className="stitch-card p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group w-full text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                            <Icon name="cloud_sync" className="text-xl text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-bold">Fix Storage Permissions (CORS)</h4>
                            <p className="text-[10px] text-muted-foreground leading-tight max-w-[200px]">Allow browser uploads to R2.</p>
                        </div>
                    </div>
                    <div className="bg-white/5 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors border border-white/5">
                        Run Fix
                    </div>
                </button>
            </SettingsSection>

            <SettingsSection title="Notifications">
              <div className="stitch-card p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <ToggleItem label="Simulation Alerts" desc="Critical threshold warnings." active />
                <ToggleItem label="Collaboration Mentions" desc="Direct tags and project invites." active />
                <ToggleItem label="System Reports" desc="Weekly usage summaries." />
              </div>
            </SettingsSection>

            <button 
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className={cn(
                "lg:hidden stitch-card p-4 border-red-500/20 bg-red-500/5 flex items-center justify-between text-red-400 transition-all",
                isLoggingOut && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon name={isLoggingOut ? "sync" : "logout"} className={cn("text-xl", isLoggingOut && "animate-spin")} />
                <span className="text-sm font-bold">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </div>
            </button>
          </div>
        </section>
      </div>
      <SidebarNav />
    </main>
  );
}

const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{title}</h3>
    <div className="flex flex-col gap-2">
      {children}
    </div>
  </div>
);

const SettingsItem = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <button className="stitch-card p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
        <Icon name={icon} className="text-xl text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex flex-col gap-1 text-left">
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight max-w-[200px]">{desc}</p>
      </div>
    </div>
    <div className="bg-white/5 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors border border-white/5">
      Manage
    </div>
  </button>
);

const ToggleItem = ({ label, desc, active = false }: { label: string, desc: string, active?: boolean }) => (
  <div className="flex items-center justify-between">
    <div className="flex flex-col gap-1">
      <h4 className="text-sm font-bold">{label}</h4>
      <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
    </div>
    <button className={cn(
      "w-10 h-5 rounded-full relative transition-all duration-300",
      active ? "bg-primary" : "bg-white/10"
    )}>
      <div className={cn(
        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
        active ? "left-6" : "left-1"
      )} />
    </button>
  </div>
);
