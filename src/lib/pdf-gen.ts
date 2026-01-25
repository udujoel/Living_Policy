import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SimulationResult, Indicator } from './types';

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
  doc.text(sim.name || sim.scenario_id || 'Analysis Report', margin, y);
  
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: SIM-${sim.scenario_id?.toUpperCase() || 'UNKNOWN'} | Timestamp: ${new Date().toLocaleString()}`, margin, y);
  
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
  const summary = sim.outcomes?.economic?.summary || sim.short_term_impact || "Analysis not available.";
  const splitSummary = doc.splitTextToSize(summary, pageWidth - (margin * 2));
  doc.text(splitSummary, margin, y);
  y += (splitSummary.length * 6) + 15;

  // 2. Key Performance Indicators (TABLE)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('2. Key Performance Indicators', margin, y);
  y += 5;

  const indicators: any[] = [];
  ['economic', 'social', 'environmental'].forEach((category) => {
      const group = sim.outcomes[category as keyof typeof sim.outcomes];
      if (group && group.indicators) {
          group.indicators.forEach((ind: Indicator) => {
              indicators.push([ind.name, category.charAt(0).toUpperCase() + category.slice(1), ind.value, ind.change, ind.trend]);
          });
      }
  });

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Category', 'Value', 'Change', 'Trend']],
    body: indicators.length ? indicators : [['No indicators available', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 3. Trade-offs & Second Order Effects
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Strategic Implications', margin, y);
  y += 5;

  const implications = [
      ...(sim.trade_offs || []).map(t => ['Trade-off', t]),
      ...(sim.second_order_effects || []).map(e => ['Second Order Effect', e])
  ];

  autoTable(doc, {
    startY: y,
    head: [['Type', 'Description']],
    body: implications.length ? implications : [['None identified', '-']],
    theme: 'striped',
    headStyles: { fillColor: [10, 17, 24], fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin }
  });

  // --- New Page: Deep Analysis ---
  doc.addPage();
  y = 30;

  // 4. SDG Alignment
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. SDG Alignment', margin, y);
  y += 5;

  const sdgs = (sim.sdg_alignment || []).map(sdg => [
      `SDG ${sdg.sdg_id}: ${sdg.sdg_name}`,
      sdg.impact_score,
      sdg.justification
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Goal', 'Impact', 'Justification']],
    body: sdgs.length ? sdgs : [['No alignment data', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236] },
    margin: { left: margin }
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text('CONFIDENTIAL - STRATEGIC ANALYSIS DOCUMENT', margin, 285);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 285);
  }

  doc.save(`${sim.name?.replace(/\s+/g, '_') || 'Policy_Analysis'}_Report.pdf`);
};
