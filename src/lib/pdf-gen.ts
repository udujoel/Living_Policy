import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SimulationResult } from './storage';

export const generatePolicyPDF = (sim: SimulationResult) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // --- Page 1: Executive Overview ---
  
  // Header Branding
  doc.setFillColor(10, 17, 24); // Dark theme background for header
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('POLICY IMPACT ANALYSIS', margin, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(19, 127, 236);
  doc.text('LIVING POLICY SIMULATOR V2.4.1 | STRATEGIC INTELLIGENCE REPORT', margin, 34);
  
  y = 55;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text(sim.scenarioName || 'Analysis Report', margin, y);
  
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: SIM-${sim.id.toUpperCase()} | Timestamp: ${new Date(sim.timestamp).toLocaleString()}`, margin, y);
  
  y += 15;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Summary', margin, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const summary = sim.data?.short_term_impact || "This comprehensive report evaluates the multi-dimensional impact of the proposed policy framework. The simulation utilizes causal reasoning models to project socio-economic shifts, environmental trajectories, and global alignment benchmarks over a 10-year horizon.";
  const splitSummary = doc.splitTextToSize(summary, pageWidth - (margin * 2));
  doc.text(splitSummary, margin, y);
  y += (splitSummary.length * 6) + 15;

  // 2. Key Performance Indicators (TABLE)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('2. Key Performance Indicators', margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Baseline', 'Proposed (2030)', 'Target', 'Variance']],
    body: [
      ['GDP Growth Rate', '1.2%', '+4.2%', '3.0%', '+1.2% Gain'],
      ['Carbon Emissions', 'Baseline', '-18%', '-15%', 'Surpassed'],
      ['Industrial Efficiency', 'Standard', '+8.2%', 'Optimized', 'High'],
      ['Energy Access', '85%', '100%', 'Universal', 'Achieved'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 3. Stakeholder Impact Matrix (TABLE)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Stakeholder Impact Matrix', margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Stakeholder Group', 'Primary Impact', 'Intensity', 'Resilience Status']],
    body: [
      ['Tech Manufacturing', 'Resource efficiency gain', 'High', 'Positive'],
      ['Urban Youth', 'Upskilling opportunities', 'Medium', 'Positive'],
      ['Small-scale Farmers', 'Transition cost burden', 'High', 'Risk/Negative'],
      ['Service Sector', 'Moderate automation risk', 'Low', 'Neutral'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [10, 17, 24], fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin }
  });

  // --- New Page: Deep Analysis ---
  doc.addPage();
  y = 30;

  // 4. Causal Reasoning Trace (TABLE)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Causal Reasoning Trace', margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Chain Level', 'Node Name', 'Description', 'Confidence']],
    body: [
      ['Root Policy', 'Efficiency Mandate', 'Targets energy benchmarks.', 'Active'],
      ['Immediate Effect', 'Price Shift', 'Operational cost fluctuation.', '98%'],
      ['Secondary Shift', 'Tech Adoption', 'Surge in smart-grid investment.', 'Med.'],
      ['Terminal Outcome', 'Emission Goal', '12M ton annual CO2 reduction.', 'High'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236] },
    margin: { left: margin }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 5. Global Framework Alignment
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Global Framework Alignment', margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Framework', 'Alignment Score', 'Global Benchmark', 'Status']],
    body: [
      ['Paris Agreement', '94%', '1.5C Pathway', 'Leading'],
      ['EU Taxonomy', '88%', 'Sustainable Finance', 'High'],
      ['ILO Standards', '96%', 'Labor Rights', 'Universal'],
      ['SDG Global Index', '82/100', 'UN 2030 Goals', 'Optimized'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [10, 17, 24] },
    margin: { left: margin }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 6. Visual Trend Projection (CUSTOM CHART)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Economic & Environmental Convergence', margin, y);
  
  y += 10;
  // Draw a simple coordinate system
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y + 40, margin + 100, y + 40); // X-axis
  doc.line(margin, y, margin, y + 40); // Y-axis
  
  // Draw Proposed Path (Rising)
  doc.setDrawColor(19, 127, 236);
  doc.setLineWidth(1);
  doc.line(margin, y + 40, margin + 25, y + 35);
  doc.line(margin + 25, y + 35, margin + 50, y + 20);
  doc.line(margin + 50, y + 20, margin + 75, y + 10);
  doc.line(margin + 75, y + 10, margin + 100, y + 5);
  
  // Draw Baseline Path (Flat)
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y + 40, margin + 100, y + 38);
  doc.setLineDashPattern([], 0); // Reset dash
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Proposed Path', margin + 105, y + 5);
  doc.text('Baseline (BAU)', margin + 105, y + 38);
  doc.text('Year 0', margin, y + 45);
  doc.text('Year 10', margin + 90, y + 45);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('CONFIDENTIAL - STRATEGIC ANALYSIS DOCUMENT', margin, 285);
  doc.text(`Page 2 of 2`, pageWidth - margin - 20, 285);

  doc.save(`${sim.scenarioName?.replace(/\s+/g, '_')}_Strategic_Report.pdf`);
};
