'use client';

import React, { useState } from 'react';
import { Icon, TopNav, BottomAction, StatusPill, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SimulatorWorkspace2() {
  const router = useRouter();
  const [isVisualizing, setIsVisualizing] = useState(false);
  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Simulation Branching" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Left Area: Context & Branch Info */}
        <div className="hidden lg:flex lg:w-[350px] flex-col border-r border-border p-8 gap-8 overflow-y-auto bg-card-alt/10">
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Context</h3>
            <div className="stitch-card p-5 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <StatusPill label="Active Branch" status="ready" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">v1.2</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Decentralized Expansion</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This branch prioritizes household-level solar adoption over centralized industrial utility upgrades.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scenario Log</h3>
            <div className="flex flex-col gap-3">
              <LogItem time="14:20" msg="Lever: Tax Rate adjusted to $75" />
              <LogItem time="14:18" msg="Constraint: Budget Cap validated" />
              <LogItem time="14:15" msg="Branch created from Baseline" />
            </div>
          </div>
        </div>

        {/* Center Area: Timeline & KPIs */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col gap-10">
          <div className="lg:hidden stitch-card p-6 border-primary/20 bg-primary/5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <StatusPill label="Active Branch" status="ready" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">v1.2</span>
            </div>
            <h4 className="font-bold text-lg mb-2">Decentralized Expansion</h4>
          </div>

          {/* Timeline View */}
          <div className="stitch-card p-8 lg:p-12 bg-card-alt/30 border-white/[0.03] shadow-2xl">
            <div className="flex items-center justify-between mb-12">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm lg:text-lg font-bold">Scenario Timeline</h3>
                <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest font-medium">Projection Horizon: 10 Years</p>
              </div>
              <span className="text-lg font-mono font-bold text-primary">2024 — 2034</span>
            </div>
            
            <div className="relative flex justify-between px-4">
              <div className="absolute top-4 left-0 right-0 h-1 bg-white/10" />
              <TimelineDot active label="Now" />
              <TimelineDot label="Year 2" />
              <TimelineDot label="Year 5" />
              <TimelineDot label="Year 10" />
            </div>
            
            <div className="grid grid-cols-4 mt-8 px-2">
              <span className="text-[10px] font-bold text-primary uppercase text-center">Baseline</span>
              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase text-center">Inflection</span>
              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase text-center">Stabilization</span>
              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase text-center">Impact Horizon</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPICard label="Affordability Index" value="72.4" trend="up" color="text-green-400" />
            <KPICard label="Inequality Gap" value="18%" trend="down" color="text-red-400" />
            <KPICard label="System Resilience" value="High" trend="up" color="text-blue-400" />
            <KPICard label="Carbon Offset" value="2.4Mt" trend="up" color="text-green-400" />
          </div>
        </div>

        {/* Right Area: Variable Quick Controls */}
        <div className="lg:w-[350px] bg-card-alt/20 border-l border-border p-6 lg:p-10 flex flex-col gap-8 overflow-y-auto">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Branch Variables</h2>
          <div className="flex flex-col border border-white/5 rounded-2xl overflow-hidden bg-card/50">
            <SliderStrip name="Subsidy Level" value="25%" />
            <SliderStrip name="Coverage Area" value="Zone A+B" />
            <SliderStrip name="Target Households" value="12,000" />
            <SliderStrip name="Tech Grant" value="$2.5M" />
          </div>

          <div className="mt-auto lg:sticky lg:bottom-0 lg:pt-10 lg:bg-gradient-to-t lg:from-background-dark lg:to-transparent flex flex-col gap-4">
            <button 
              onClick={() => {
                setIsVisualizing(true);
                setTimeout(() => {
                  router.push('/visualization');
                }, 1000);
              }}
              disabled={isVisualizing}
              className={cn(
                "stitch-button-primary w-full flex items-center justify-center gap-3 py-4 shadow-2xl shadow-primary/20 transition-all",
                isVisualizing && "opacity-80 cursor-wait"
              )}
            >
              {isVisualizing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Visualization...</span>
                </div>
              ) : (
                <>
                  <Icon name="query_stats" className="text-2xl" />
                  <span className="text-lg font-bold">View Visualizations</span>
                </>
              )}
            </button>
            <button className="stitch-button-secondary w-full flex items-center justify-center gap-3 py-3 border-white/5">
              <Icon name="history" className="text-xl" />
              <span className="text-sm font-bold uppercase tracking-widest">Compare Branches</span>
            </button>
          </div>
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

const LogItem = ({ time, msg }: { time: string, msg: string }) => (
  <div className="flex gap-3 text-[10px] font-mono">
    <span className="text-muted-foreground/40">{time}</span>
    <span className="text-muted-foreground/80">{msg}</span>
  </div>
);

const TimelineDot = ({ active = false, label }: { active?: boolean, label: string }) => (
  <div className="relative z-10 flex flex-col items-center gap-3">
    <div className={cn(
      "w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all",
      active ? "bg-primary shadow-[0_0_20px_rgba(19,127,236,0.6)] scale-110" : "bg-card-alt border-4 border-background-dark ring-1 ring-white/10"
    )}>
      {active ? <Icon name="play_arrow" className="text-white text-xl" fill /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
    </div>
    <span className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-primary" : "text-muted-foreground/30")}>{label}</span>
  </div>
);

const KPICard = ({ label, value, trend, color }: { label: string, value: string, trend: 'up' | 'down', color: string }) => (
  <div className="stitch-card p-5 flex flex-col gap-2">
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold font-mono tracking-tight">{value}</span>
      <Icon name={trend === 'up' ? 'trending_up' : 'trending_down'} className={cn("text-xl", color)} />
    </div>
  </div>
);

const SliderStrip = ({ name, value }: { name: string, value: string }) => (
  <div className="bg-card-alt/50 p-4 border-b border-white/5 last:border-0 flex items-center justify-between group hover:bg-white/[0.02] transition-colors cursor-pointer">
    <span className="text-sm font-medium">{name}</span>
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-muted-foreground">{value}</span>
      <Icon name="edit" className="text-lg text-muted-foreground/30 group-hover:text-primary transition-colors" />
    </div>
  </div>
);
