'use client';

import React from 'react';
import { Icon, TopNav, SearchBar, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';

export default function HelpPage() {
  const tutorials = [
    { title: 'Scenario Branching', desc: 'How to compare multiple policy alternatives.', duration: '12 min', color: 'from-blue-500 to-indigo-600', icon: 'distance' },
    { title: 'Data Normalization', desc: 'Using logic nodes to align diverse datasets.', duration: '18 min', color: 'from-purple-500 to-pink-600', icon: 'query_stats' },
  ];

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0">
      <TopNav title="Knowledge Hub" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Sidebar: Categories */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col gap-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Categories</h2>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            <FilterChip label="FAQ" active />
            <FilterChip label="Glossary" />
            <FilterChip label="Tutorials" />
            <FilterChip label="Technical Docs" />
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          <SearchBar placeholder="Search help, patterns, or terms..." />

          <div className="flex flex-col gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Guided Tutorials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((t, i) => (
                <div key={i} className="stitch-card overflow-hidden flex flex-col gap-4 bg-card-alt/50">
                  <div className={cn("h-32 p-6 flex items-end justify-between bg-gradient-to-br", t.color)}>
                    <Icon name={t.icon} className="text-4xl text-white/50" />
                    <span className="bg-black/20 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-widest">
                      {t.duration}
                    </span>
                  </div>
                  <div className="p-6 pt-0">
                    <h4 className="font-bold text-lg mb-1">{t.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t.desc}</p>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Common Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <QuickLink title="How is causal reasoning calculated?" />
              <QuickLink title="Can I export data for GIS tools?" />
              <QuickLink title="Collaborating on a shared project" />
              <QuickLink title="Managing custom model constants" />
            </div>
          </div>
        </section>
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

const QuickLink = ({ title }: { title: string }) => (
  <button className="stitch-card p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left">
    <span className="text-sm font-medium">{title}</span>
    <Icon name="open_in_new" className="text-lg text-muted-foreground/30" />
  </button>
);
