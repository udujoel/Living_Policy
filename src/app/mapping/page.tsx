'use client';

import React, { useState } from 'react';
import { Icon, TopNav, BottomAction, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';

export default function MappingPage() {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      alert('Transformation applied successfully to the policy engine.');
    }, 1500);
  };
  return (
    <main className="max-container flex flex-col h-screen overflow-hidden font-mono pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Data Mapping" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Left Sidebar: Progress & Info */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col gap-8 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold tracking-tight">85% Mapped</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Model: Policy Engine v1</span>
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(19,127,236,0.5)]" />
            </div>
            <div className="flex gap-2 mt-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Icon name="warning" className="text-sm" /> 2 Issues
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                <Icon name="close" className="text-sm" /> 1 Error
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Active Transformation</h3>
            <div className="stitch-card p-4 bg-black/40 border-white/5 flex flex-col gap-3">
              <code className="text-xs text-green-400 leading-relaxed">
                value / 1000 * offset_coef
              </code>
              <div className="flex gap-2 flex-wrap">
                <LogicChip label="Normalization" />
                <LogicChip label="Validation" />
                <LogicChip label="Fallback: 0" />
              </div>
            </div>
          </div>

          <div className="mt-auto hidden lg:block">
            <button 
              onClick={handleApply}
              disabled={isApplying}
              className={cn(
                "stitch-button-primary w-full flex items-center justify-center gap-2 py-4 transition-all",
                isApplying && "opacity-80 cursor-wait"
              )}
            >
              <Icon name={isApplying ? "sync" : "check_circle"} className={cn("text-xl", isApplying && "animate-spin")} />
              <span>{isApplying ? "Applying..." : "Apply Changes"}</span>
            </button>
          </div>
        </aside>

        {/* Main Mapping Area */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 relative border border-white/5 rounded-2xl bg-card-alt/20 p-8 lg:p-12 flex justify-between overflow-hidden">
            {/* SVG Connector Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-primary/20 fill-none stroke-[1.5]">
              <path d="M 200 100 C 300 100, 400 200, 500 200" />
              <path d="M 200 300 C 300 300, 400 100, 500 100" className="stroke-red-400/40 stroke-dashed" />
              <path d="M 200 500 C 300 500, 400 500, 500 500" />
            </svg>

            {/* Left Column: Source */}
            <div className="flex flex-col gap-8 z-10 w-[160px] lg:w-[200px]">
              <MappingNode label="census_pop_2023" type="INT64" />
              <MappingNode label="income_med" type="FLOAT" active error />
              <MappingNode label="geo_id" type="STRING" />
              <MappingNode label="housing_units" type="INT64" />
            </div>

            {/* Floating Node Button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <button className="w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center border-4 border-background-dark hover:scale-110 transition-transform">
                <Icon name="settings" className="text-white text-2xl" />
              </button>
            </div>

            {/* Right Column: Target */}
            <div className="flex flex-col gap-8 z-10 w-[160px] lg:w-[200px] text-right">
              <MappingNode label="Target Pop" type="NUMERIC" right />
              <MappingNode label="Fiscal Cap" type="CURRENCY" right active />
              <MappingNode label="Demog Delta" type="RATIO" right />
              <MappingNode label="Unit Count" type="INTEGER" right />
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <BottomAction 
            label={isApplying ? "Applying..." : "Apply Transformation"} 
            icon={isApplying ? "sync" : "check_circle"} 
            onClick={handleApply}
          />
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

const MappingNode = ({ label, type, right = false, active = false, error = false }: { label: string, type: string, right?: boolean, active?: boolean, error?: boolean }) => (
  <div className={cn(
    "p-3 rounded-lg border bg-card/80 transition-all",
    active ? (error ? "border-red-400/40 ring-1 ring-red-400/20" : "border-primary/40 ring-1 ring-primary/20") : "border-white/10"
  )}>
    <p className={cn("text-[10px] font-bold mb-1 truncate", active ? "text-foreground" : "text-muted-foreground")}>{label}</p>
    <div className={cn("flex items-center gap-1.5", right ? "justify-end" : "justify-start")}>
      {!right && <div className={cn("w-1.5 h-1.5 rounded-full", active ? (error ? "bg-red-400" : "bg-primary") : "bg-white/10")} />}
      <span className="text-[8px] font-bold text-muted-foreground/50 tracking-tighter">{type}</span>
      {right && <div className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-primary" : "bg-white/10")} />}
    </div>
  </div>
);

const LogicChip = ({ label }: { label: string }) => (
  <span className="text-[8px] font-bold text-white/40 border border-white/5 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">
    {label}
  </span>
);
