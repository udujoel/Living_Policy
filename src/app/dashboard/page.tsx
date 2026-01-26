'use client';

import React, { useEffect, useState } from 'react';
import { Icon, StatusPill, ProgressBar, SearchBar, SidebarNav, TopNav } from '@/components/SharedUI';
import Link from 'next/link';
import { getStoredUploads, UploadedFile, deleteUpload } from '@/lib/storage';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  useEffect(() => {
    setRecentUploads(getStoredUploads());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteUpload(id);
    setRecentUploads(getStoredUploads());
  };

  const handleDownload = (e: React.MouseEvent, file: UploadedFile) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (file.source && file.source.startsWith('http')) {
      // Use R2/Public URL if available
      const a = document.createElement('a');
      a.href = file.source;
      a.target = '_blank';
      a.download = file.name;
      a.click();
    } else {
      // Fallback for old local files
      const blob = new Blob(["Policy content for " + file.name], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
    }
  };

  const staticProjects: any[] = [];

  // Merge uploads into projects
  const uploadedProjects = recentUploads.map(f => ({
    id: f.id,
    title: f.name,
    desc: `Automated AI analysis of ${f.name} for ${f.source}.`,
    status: f.status === 'Parsed' ? 'ready' : 'analyzing',
    progress: f.status === 'Parsed' ? 100 : 45,
    scenarios: 0,
    updated: 'Just now',
    color: 'bg-indigo-500'
  }));

  const allProjects = [...uploadedProjects, ...staticProjects];

  const filteredProjects = allProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.status.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="max-container flex flex-col min-h-screen pb-20 lg:pb-0">
      <TopNav title="Project Dashboard" />

      <div className="px-6 lg:px-12 flex flex-col gap-6 mt-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl lg:text-3xl font-bold">Projects</h2>
          <Link href="/upload" className="bg-primary p-2 lg:p-3 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20">
            <Icon name="add" className="text-white text-2xl" />
            <span className="hidden lg:inline text-white font-bold text-sm uppercase tracking-widest">New Project</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <SearchBar 
            placeholder="Search projects..." 
            className="lg:max-w-md" 
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {['All', 'Analyzing', 'Ready', 'Archived'].map(filter => (
              <FilterChip 
                key={filter}
                label={filter} 
                active={activeFilter === filter} 
                onClick={() => setActiveFilter(filter)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
          {filteredProjects.length > 0 ? filteredProjects.map((p) => (
            <Link key={p.id} href={`/analysis?file=${encodeURIComponent(p.title)}`} className="stitch-card p-6 hover:border-primary/50 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className={cn("p-3 rounded-xl bg-opacity-20", p.color)}>
                  <Icon name="description" className={cn("text-3xl", p.color.replace('bg-', 'text-'))} />
                </div>
                <StatusPill label={p.status} status={p.status as any} />
              </div>
              
              <h3 className="font-bold text-xl mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-8 leading-relaxed flex-1">
                {p.desc}
              </p>

              <div className="mb-8">
                <ProgressBar progress={p.progress} label="AI Simulation Progress" />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Icon name="history" className="text-base" />
                    <span>{p.scenarios} Scenarios</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Icon name="person" className="text-base" />
                    <span>3 Collabs</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{p.updated}</span>
              </div>
            </Link>
          )) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-muted-foreground gap-6 text-center animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center border border-primary/10 mb-2">
                <Icon name="folder_open" className="text-5xl text-primary/40" />
              </div>
              <div className="flex flex-col gap-2 max-w-sm">
                <h3 className="text-xl font-bold text-foreground">No Projects Yet</h3>
                <p className="text-sm font-medium leading-relaxed opacity-60">Upload your first policy document to start simulating causal scenarios and SDG impacts.</p>
              </div>
              <Link href="/upload" className="stitch-button-primary px-8 py-3 flex items-center gap-2 mt-4 group">
                <Icon name="add" className="text-xl group-hover:rotate-90 transition-transform" />
                <span>Create First Project</span>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 mb-12">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 ml-1">Recently Uploaded Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentUploads.length > 0 ? (
              recentUploads.slice(0, 4).map((f) => (
                <div key={f.id} className="group relative">
                  <Link href={`/analysis?file=${encodeURIComponent(f.name)}`} className="stitch-card p-4 flex items-center justify-between bg-card-alt/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white/5 rounded border border-white/5">
                        <Icon name="description" className="text-lg text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{f.name}</span>
                        <span className="text-[8px] text-muted-foreground uppercase">{f.size} • {f.status}</span>
                      </div>
                    </div>
                    <Icon name="arrow_forward" className="text-lg text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDownload(e, f)}
                      className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                      title="Download"
                    >
                      <Icon name="download" className="text-lg" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, f.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Icon name="delete" className="text-lg" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground ml-1">No policies uploaded yet.</p>
            )}
          </div>
        </div>
      </div>

      <SidebarNav />
    </main>
  );
}

const FilterChip = ({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "filter-chip",
      active ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground"
    )}
  >
    {label}
  </button>
);

const RecentItem = ({ title, time }: { title: string, time: string }) => (
  <div className="stitch-card p-4 flex items-center justify-between bg-card-alt/50">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-white/5 rounded border border-white/5">
        <Icon name="history" className="text-lg text-muted-foreground" />
      </div>
      <span className="text-sm font-medium">{title}</span>
    </div>
    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">{time}</span>
  </div>
);
