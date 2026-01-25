'use client';

import React from 'react';
import { Icon, TopNav, BottomAction, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';

export default function ComparisonPage() {
  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Comparison Builder" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Sidebar: Include Scenarios */}
        <aside className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-white/5 overflow-y-auto p-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Expose Scenarios</h2>
            <p className="text-sm text-muted-foreground ml-1">Configure what external viewers see when you share your simulation results.</p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Include Scenarios</h3>
            <div className="grid grid-cols-1 gap-3">
              <SelectionCard title="Baseline: Current Policy" active />
              <SelectionCard title="Scenario A: High Subsidy" active />
              <SelectionCard title="Scenario B: Decentralized" />
            </div>
          </div>
        </aside>

        {/* Main Content: Visibility & Preview */}
        <section className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-32">
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Visibility Settings</h3>
            <div className="stitch-card p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ToggleItem label="Public Access" desc="Anyone with the link can view." />
              <ToggleItem label="Interactive Charts" desc="Allow users to toggle KPI views." active />
              <ToggleItem label="Anonymize Inputs" desc="Hide specific lever values." active />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Preview Strip</h3>
            <div className="stitch-card p-4 h-64 bg-card-alt/30 border-dashed border-2 flex items-center justify-center relative overflow-hidden group">
              <div className="flex gap-4 opacity-40 group-hover:opacity-60 transition-opacity">
                <div className="w-24 h-32 bg-white/10 rounded" />
                <div className="w-48 h-32 bg-white/10 rounded" />
                <div className="w-24 h-32 bg-white/10 rounded" />
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background-dark/40 backdrop-blur-[2px]">
                Click to preview public view
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="lg:fixed lg:bottom-8 lg:right-8">
        <BottomAction label="Generate Public Link" icon="share" />
      </div>
      <SidebarNav />
    </main>
  );
}

const SelectionCard = ({ title, active = false }: { title: string, active?: boolean }) => (
  <button className={cn(
    "stitch-card p-4 flex items-center justify-between transition-all",
    active ? "border-primary/40 bg-primary/5" : "border-white/5 hover:bg-white/[0.02]"
  )}>
    <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>{title}</span>
    <div className={cn(
      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
      active ? "bg-primary border-primary" : "bg-white/5 border-white/10"
    )}>
      {active && <Icon name="check_circle" className="text-white text-xs" />}
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
