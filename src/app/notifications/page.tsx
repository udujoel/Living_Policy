'use client';

import React from 'react';
import { Icon, TopNav, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const items = [
    { type: 'Risks', title: 'Fiscal Threshold Warning', desc: 'Scenario B exceeds budget cap in Year 4.', time: '10:42 AM', icon: 'warning', color: 'bg-amber-500', status: 'Requires review' },
    { type: 'System', title: 'Analysis Complete', desc: 'Clean Energy Act draft successfully parsed.', time: '09:15 AM', icon: 'check_circle', color: 'bg-green-500' },
    { type: 'Mentions', title: 'Sarah tagged you', desc: 'Please check the trade-offs on the new branch.', time: 'Yesterday', icon: 'person', color: 'bg-blue-500' },
  ];

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0">
      <TopNav title="Activity Center" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Sidebar: Filters */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col gap-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Filters</h2>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            <FilterChip label="All" active />
            <FilterChip label="Mentions" />
            <FilterChip label="System" />
            <FilterChip label="Risks" />
          </div>
          
          <div className="mt-auto hidden lg:flex flex-col gap-2">
            <button className="stitch-card p-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors text-left">
              Mark all as read
            </button>
            <button className="stitch-card p-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-red-400 transition-colors text-left">
              Clear all history
            </button>
          </div>
        </aside>

        {/* Main Content: Notification List */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 pr-2 lg:pr-12">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 ml-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full" />
                Today
              </h2>
              <div className="flex flex-col gap-1">
                {items.slice(0, 2).map((item, i) => (
                  <NotificationItem key={i} {...item} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 ml-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                Earlier this week
              </h2>
              <div className="flex flex-col gap-1">
                {items.slice(2).map((item, i) => (
                  <NotificationItem key={i} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

const FilterChip = ({ label, active = false }: { label: string, active?: boolean }) => (
  <button className={cn(
    "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
    active ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground"
  )}>
    {label}
  </button>
);

const NotificationItem = ({ title, desc, time, icon, color, status }: any) => (
  <div className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0">
    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", color + "/10")}>
      <Icon name={icon} className={cn("text-xl", color.replace('bg-', 'text-'))} />
    </div>
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold">{title}</h4>
        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">{time}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      {status && (
        <span className="text-[8px] font-bold uppercase tracking-widest text-primary mt-1">{status}</span>
      )}
    </div>
    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-1 hover:bg-white/5 rounded"><Icon name="open_in_new" className="text-sm" /></button>
      <button className="p-1 hover:bg-white/5 rounded"><Icon name="close" className="text-sm" /></button>
    </div>
  </div>
);
