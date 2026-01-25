'use client';

import React, { useState } from 'react';
import { Icon, TopNav, BottomAction, SearchBar, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MapPage() {
  const router = useRouter();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeLayer, setActiveLayer] = useState('heatmap');

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      router.push('/report');
    }, 2000);
  };

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Geospatial Impact Map" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-w-[1800px] mx-auto w-full">
        {/* Sidebar: Regional Analysis */}
        <aside className="hidden lg:flex w-[400px] border-r border-white/5 bg-background-dark/50 backdrop-blur-xl p-8 flex-col gap-10 z-20 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Spatial Search</h2>
              <SearchBar placeholder="Enter jurisdiction or zip code..." />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Economic" active />
              <FilterChip label="Demographic" />
              <FilterChip label="Infrastructure" />
              <FilterChip label="Eco-Health" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regional Analysis</h2>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">3 Alerts</span>
            </div>

            <div className="flex flex-col gap-4">
              <RegionalAnalysisCard 
                name="Downtown Core" 
                status="High Benefit" 
                metrics={[
                  { label: 'Econ Lift', val: '+14%' },
                  { label: 'Carbon', val: '-8%' }
                ]}
                color="green"
              />
              <RegionalAnalysisCard 
                name="Industrial West" 
                status="Moderate Risk" 
                metrics={[
                  { label: 'Econ Lift', val: '+2%' },
                  { label: 'Carbon', val: '+4%' }
                ]}
                color="amber"
              />
              <RegionalAnalysisCard 
                name="Residential East" 
                status="Neutral" 
                metrics={[
                  { label: 'Econ Lift', val: '+1%' },
                  { label: 'Carbon', val: '-2%' }
                ]}
                color="gray"
              />
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className={cn(
                "stitch-button-primary w-full flex items-center justify-center gap-3 py-5 text-sm font-bold uppercase tracking-widest transition-all shadow-2xl shadow-primary/20",
                isGeneratingReport && "opacity-80"
              )}
            >
              {isGeneratingReport ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="description" className="text-xl" />
              )}
              <span>{isGeneratingReport ? "Finalizing Analysis..." : "Generate Final Report"}</span>
            </button>
          </div>
        </aside>

        {/* Map Viewport */}
        <div className="flex-1 relative overflow-hidden bg-[#0d141b]">
          {/* Mock Google Maps Background */}
          <div className="absolute inset-0 grayscale opacity-40 mix-blend-screen pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop" 
              className="w-full h-full object-cover"
              alt="City Map"
            />
          </div>

          <div className="absolute inset-0 pointer-events-none">
             <svg className="w-full h-full opacity-30" viewBox="0 0 1000 1000">
               <path d="M100,200 Q300,100 500,250 T900,200 V800 Q700,900 500,750 T100,800 Z" fill="none" stroke="white" strokeWidth="0.5" />
               <path d="M200,300 Q400,200 600,350 T800,300" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="5,5" />
               <circle cx="300" cy="400" r="100" fill="none" stroke="white" strokeWidth="0.1" />
               <circle cx="700" cy="600" r="150" fill="none" stroke="white" strokeWidth="0.1" />
             </svg>
          </div>

          {/* Interactive Heatmap Layers */}
          {activeLayer === 'heatmap' && (
            <>
              <div className="absolute top-[20%] left-[30%] w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute top-[50%] left-[50%] w-96 h-96 bg-amber-500/15 rounded-full blur-[100px]" />
              <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-green-500/10 rounded-full blur-[90px]" />
            </>
          )}

          {activeLayer === 'infrastructure' && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1000 1000">
                <path d="M0,500 L1000,500" stroke="#137fec" strokeWidth="2" strokeDasharray="10,5" className="opacity-40" />
                <path d="M500,0 L500,1000" stroke="#137fec" strokeWidth="2" strokeDasharray="10,5" className="opacity-40" />
              </svg>
            </div>
          )}

          {/* Interactive Map Elements */}
          <MapMarker x="35%" y="42%" color="green" pulse />
          <MapMarker x="62%" y="58%" color="amber" />
          <MapMarker x="48%" y="25%" color="green" />
          <MapMarker x="75%" y="30%" color="red" />
          
          {/* Layer Control Modal (Mock) */}
          <div className="absolute left-8 bottom-8 z-30 flex flex-col gap-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-2">Map Layers</h4>
            <div className="bg-background-dark/80 backdrop-blur-xl border border-white/10 p-2 rounded-xl flex gap-2">
              <LayerBtn active={activeLayer === 'heatmap'} onClick={() => setActiveLayer('heatmap')} label="Heatmap" />
              <LayerBtn active={activeLayer === 'infrastructure'} onClick={() => setActiveLayer('infrastructure')} label="Infra" />
              <LayerBtn active={activeLayer === 'demographic'} onClick={() => setActiveLayer('demographic')} label="Demo" />
            </div>
          </div>
          
          {/* Zoom/Map Controls */}
          <div className="absolute right-8 top-8 lg:top-12 flex flex-col gap-3 z-30">
            <MapActionBtn icon="add" label="Zoom In" />
            <MapActionBtn icon="remove" label="Zoom Out" />
            <div className="h-4" />
            <MapActionBtn icon="my_location" label="Re-center" />
            <MapActionBtn icon="layers" label="Layers" active />
          </div>

          {/* Mobile Overlay Search & Legend */}
          <div className="lg:hidden absolute top-6 left-6 right-6 flex flex-col gap-4 z-30">
            <SearchBar placeholder="Search jurisdiction..." className="shadow-2xl shadow-black/50" />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <FilterChip label="Economic" active />
              <FilterChip label="Eco-Health" />
              <FilterChip label="Demographic" />
            </div>
          </div>

          <div className="lg:hidden absolute bottom-6 left-6 right-6 z-30">
            <RegionalAnalysisCard 
              name="Downtown Core" 
              status="High Benefit" 
              metrics={[{ label: 'Econ Lift', val: '+14%' }, { label: 'Carbon', val: '-8%' }]}
              color="green"
              compact
            />
          </div>
        </div>

        <div className="lg:hidden">
          <BottomAction 
            label={isGeneratingReport ? "Preparing Report..." : "Generate Final Report"} 
            icon="description" 
            onClick={handleGenerateReport}
          />
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

const LayerBtn = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
      active ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    )}
  >
    {label}
  </button>
);

const RegionalAnalysisCard = ({ name, status, metrics, color, compact = false }: any) => (
  <div className={cn(
    "stitch-card group hover:border-white/10 transition-all",
    compact ? "p-4 bg-background-dark/90 backdrop-blur-md" : "p-6 bg-card-alt/20"
  )}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-col">
        <h4 className="font-bold text-sm lg:text-base">{name}</h4>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          color === 'green' ? "text-green-400" : color === 'amber' ? "text-amber-400" : color === 'red' ? "text-red-400" : "text-muted-foreground"
        )}>
          {status}
        </span>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full",
        color === 'green' ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : 
        color === 'amber' ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
        "bg-white/20"
      )} />
    </div>

    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m: any, i: number) => (
        <div key={i} className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
          <span className="text-[8px] font-bold text-muted-foreground uppercase">{m.label}</span>
          <span className="text-xs font-bold font-mono text-foreground/90">{m.val}</span>
        </div>
      ))}
    </div>
  </div>
);

const MapMarker = ({ x, y, color, pulse = false }: any) => (
  <div 
    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
    style={{ left: x, top: y }}
  >
    <div className={cn(
      "w-4 h-4 rounded-full border-2 border-white/20 transition-transform group-hover:scale-125",
      color === 'green' ? "bg-green-500" : color === 'amber' ? "bg-amber-500" : "bg-red-500",
      pulse && "animate-pulse"
    )} />
    {pulse && (
      <div className={cn(
        "absolute -inset-2 rounded-full opacity-30 animate-ping",
        color === 'green' ? "bg-green-500" : color === 'amber' ? "bg-amber-500" : "bg-red-500"
      )} />
    )}
  </div>
);

const MapActionBtn = ({ icon, label, active = false }: any) => (
  <div className="relative group">
    <button className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-2xl",
      active ? "bg-primary border-primary text-white" : "bg-card-alt/90 backdrop-blur-xl border-white/10 text-muted-foreground hover:text-foreground"
    )}>
      <Icon name={icon} className="text-xl" />
    </button>
    <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-background-dark border border-white/10 rounded text-[8px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </div>
  </div>
);

const FilterChip = ({ label, active = false }: { label: string, active?: boolean }) => (
  <button className={cn(
    "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all shadow-lg backdrop-blur-md",
    active ? "bg-primary border-primary text-white" : "bg-card-alt/80 border-white/10 text-muted-foreground hover:text-foreground"
  )}>
    {label}
  </button>
);

