'use client';

import React, { useState, useEffect } from 'react';
import { Icon, TopNav, SidebarNav, SearchBar } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getStoredSimulations } from '@/lib/storage';
import { generatePolicyPDF } from '@/lib/pdf-gen';

export default function PolicyLibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Draft' | 'Completed'>('Completed');
  const [activeFilter, setActiveFilter] = useState('All');
  const [storedSimulations, setStoredSimulations] = useState<any[]>([]);

  useEffect(() => {
    setStoredSimulations(getStoredSimulations());
  }, []);

  const policies = [
    ...storedSimulations.map(sim => ({
      id: sim.id,
      title: sim.scenarioName ? `${sim.scenarioName}` : 'Unnamed Analysis',
      desc: `Comprehensive multi-dimensional impact report including Causal Trace, SDG Alignment, and Economic Projection.`,
      date: new Date(sim.timestamp).toLocaleDateString(),
      category: 'POLICY ANALYSIS',
      status: sim.status || 'Completed',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      rawData: sim
    }))
  ];

  const filteredPolicies = policies.filter(p => {
    if (activeFilter !== 'All' && p.category !== activeFilter.toUpperCase()) return false;
    return p.status === activeTab;
  });

  return (
    <main className="max-container flex flex-col min-h-screen bg-[#061009] text-foreground pb-24 lg:pb-0">
      <TopNav 
        title="Policy Library" 
        showBack={true} 
        rightElement={
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white">
            <Icon name="more_vert" className="text-2xl" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Search */}
        <SearchBar placeholder="Search policies..." className="bg-white/5 border-white/5 rounded-xl h-14" />

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Urban', 'Health', 'Education'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                activeFilter === f 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              {f}
              {f !== 'All' && <Icon name="expand_more" className="ml-1 text-[8px]" />}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {(['Draft', 'Completed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
                activeTab === t ? "bg-white/10 text-white shadow-xl" : "text-muted-foreground hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Policy List */}
        <div className="flex flex-col gap-4 mt-2">
          {filteredPolicies.map((p) => (
            <div key={p.id} className="stitch-card p-6 bg-white/[0.02] border-white/5 flex flex-col gap-5 relative group hover:bg-white/[0.04] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest", p.bgColor, p.color)}>
                      {p.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">{p.date}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pr-4">{p.desc}</p>
                </div>
                
                {/* Visual indicator (radar thumbnail) */}
                <div className="w-20 h-20 bg-primary/5 rounded-xl border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                   <Icon name="pentagon" className={cn("text-4xl opacity-40 relative z-10", p.color)} />
                   {/* Decorative lines to simulate radar chart */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-10">
                     <div className="w-full h-[1px] bg-white rotate-0" />
                     <div className="w-full h-[1px] bg-white rotate-45" />
                     <div className="w-full h-[1px] bg-white rotate-90" />
                     <div className="w-full h-[1px] bg-white rotate-135" />
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", p.status === 'Completed' ? "bg-green-500" : "bg-blue-400")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{p.status}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      generatePolicyPDF(p.rawData);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
                    title="Download PDF"
                  >
                    <Icon name="download" className="text-sm" />
                  </button>
                  <button 
                    onClick={() => router.push(`/visualization?simId=${p.id}`)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                      p.status === 'Completed' 
                        ? "bg-primary text-white hover:scale-105" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    <span>{p.status === 'Completed' ? 'View Results' : 'Resume'}</span>
                    <Icon name={p.status === 'Completed' ? 'arrow_forward' : 'play_arrow'} className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredPolicies.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-40">
              <Icon name="search_off" className="text-5xl" />
              <span className="text-xs font-bold uppercase tracking-widest">No policies found in {activeTab}</span>
            </div>
          )}
        </div>
      </div>

      <SidebarNav />
    </main>
  );
}
