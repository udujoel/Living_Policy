'use client';

import React, { useState } from 'react';
import { Icon, TopNav, BottomAction, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';

export default function ReportPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Create a dummy download
      const link = document.createElement('a');
      link.href = '#';
      link.download = 'LPS_Final_Report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2500);
  };

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Final Policy Report" />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-16 max-w-7xl mx-auto flex flex-col gap-16 pb-32">
          {/* Executive Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded border border-primary/20 uppercase tracking-widest">Scenario B</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confidence Score: 94%</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Clean Energy Transition Path</h2>
              <div className="flex flex-wrap items-center gap-6 mt-2">
                <ReportInfo icon="calendar_today" label="Generated" value="Jan 18, 2026" />
                <ReportInfo icon="location_on" label="Jurisdiction" value="State of Illinois" />
                <ReportInfo icon="security" label="Classification" value="Decision Support" />
              </div>
            </div>
            
            <div className="hidden lg:flex gap-4">
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className={cn(
                  "stitch-button-primary flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all",
                  isExporting && "opacity-80"
                )}
              >
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="file_download" className="text-xl" />
                )}
                <span>{isExporting ? "Compiling PDF..." : "Download Report"}</span>
              </button>
            </div>
          </div>

          {/* Key Impact Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ReportMetricCard 
              label="Fiscal Balance Change" 
              value="-$420M" 
              sub="10yr Proj. Cost"
              color="text-red-400" 
            />
            <ReportMetricCard 
              label="Social Equity Score" 
              value="84/100" 
              sub="+14% Improvement"
              color="text-green-400" 
            />
            <ReportMetricCard 
              label="Public Debt Evolution" 
              value="+2.4%" 
              sub="Net Stability Risk"
              color="text-amber-400" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Narrative Summary */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Executive Summary</h3>
              <div className="stitch-card p-10 bg-card-alt/30 border-white/5 relative group">
                <p className="text-lg lg:text-xl leading-relaxed text-foreground/90 font-serif italic relative z-10">
                  "Over the next 10 years, the Proposed Transition suggests a significant acceleration in decentralized energy adoption. While initial fiscal outlays are 15% higher than baseline, the long-term reduction in grid maintenance costs and the 12% increase in regional energy security provide a stable economic floor. Social equity scores peak in Year 6 as low-income housing retrofits are completed. This transition path balances immediate fiscal pressure against generational energy independence."
                </p>
              </div>
            </div>

            {/* Assumptions & Safety */}
            <div className="lg:col-span-5 flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Model Assumptions</h3>
                <div className="stitch-card p-8 flex flex-col gap-6 bg-card-alt/20">
                  <AssumptionItem icon="groups" text="Assumes 85% consumer participation by Year 5" />
                  <AssumptionItem icon="trending_up" text="Sensitive to federal interest rate fluctuations" />
                  <AssumptionItem icon="check_circle" text="Model accounts for seasonal yield variations" />
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-4 shadow-2xl shadow-amber-500/5">
                <div className="flex items-center gap-3 text-amber-500">
                  <Icon name="shield" className="text-2xl" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">AI Safety Disclaimer</span>
                </div>
                <p className="text-[11px] text-amber-200/60 leading-relaxed font-medium">
                  This report is generated by an AI-based simulator for educational and decision-support exploration. It does not constitute legal, financial, or specific policy advice. Simulation results are probabilistic and should be reviewed by human experts before implementation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-6 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 flex gap-4 z-50">
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="stitch-button-primary flex-1 py-4 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest shadow-2xl shadow-primary/30"
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Icon name="file_download" className="text-xl" />
          )}
          <span>{isExporting ? "Exporting..." : "Download PDF"}</span>
        </button>
      </div>
      <SidebarNav />
    </main>
  );
}

const ReportInfo = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-2">
    <Icon name={icon} className="text-sm text-muted-foreground" />
    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{label}:</span>
    <span className="text-[10px] font-bold text-foreground">{value}</span>
  </div>
);

const ReportMetricCard = ({ label, value, sub, color }: any) => (
  <div className="stitch-card p-8 flex flex-col gap-4 bg-card-alt/20 border-white/[0.03] hover:border-white/10 transition-all">
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-3">
      <span className={cn("text-4xl font-bold font-mono tracking-tighter", color)}>{value}</span>
      <span className="text-[10px] font-bold text-muted-foreground/60">{sub}</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={cn("h-full w-2/3 rounded-full opacity-50", color.replace('text-', 'bg-'))} />
    </div>
  </div>
);

const AssumptionItem = ({ icon, text }: any) => (
  <div className="flex items-start gap-4 group">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
      <Icon name={icon} className="text-primary text-base" />
    </div>
    <span className="text-xs font-medium text-foreground/70 leading-relaxed group-hover:text-foreground transition-colors pt-1">{text}</span>
  </div>
);
