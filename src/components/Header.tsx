'use client';

import React from 'react';
import { Activity, LayoutDashboard, Globe, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Living Policy Simulator</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Intelligence Engine v1.0</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <NavLink icon={<LayoutDashboard className="w-4 h-4" />} label="Simulate" active />
        <NavLink icon={<Globe className="w-4 h-4" />} label="Global Impact" />
        <NavLink icon={<Shield className="w-4 h-4" />} label="Compliance" />
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full border border-border">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium">Gemini 3 Online</span>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-2 text-sm font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
    {icon}
    <span>{label}</span>
  </a>
);
