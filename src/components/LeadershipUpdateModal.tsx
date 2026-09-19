import React, { useState } from 'react';
import { 
  X, Sparkles, Copy, Check, Download, FileText, 
  Calendar, Layers, ShieldAlert, TrendingUp, RefreshCw, FileDown 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { CleanDeal, CleanWorkOrder, DataHealthReport, ExecutiveKPIs } from '../types';
import { SectorMetric } from '../lib/analyticsEngine';

interface LeadershipUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: CleanDeal[];
  workOrders: CleanWorkOrder[];
  kpis: ExecutiveKPIs;
  sectorMetrics: SectorMetric[];
  dataHealth: DataHealthReport;
}

export const LeadershipUpdateModal: React.FC<LeadershipUpdateModalProps> = ({
  isOpen,
  onClose,
  deals,
  workOrders,
  kpis,
  sectorMetrics,
  dataHealth
}) => {
  if (!isOpen) return null;

  const [updateType, setUpdateType] = useState<'weekly_digest' | 'board_deck' | 'risk_radar' | 'sector_strategy'>('weekly_digest');
  const [focusPeriod, setFocusPeriod] = useState('Current Quarter (Q3 2024)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>(`# Skylark Drones - Executive Leadership Briefing
**Period:** Current Quarter (Q3 2024)  
**Author:** AI Business Intelligence Agent  
**Audience:** Founders, Board of Directors, Head of Flight Operations  

---

### 1. Executive Summary & North Star Velocity
- **Pipeline Expansion:** Active sales pipeline stands at **$1.13M** across 7 enterprise opportunities, representing healthy expansion in renewable energy and open-cast mining.
- **Bookings Realization:** **$843,000** closed-won bookings secured year-to-date with an aggregate win rate of **78%**.
- **Field Ops Delivery:** Operations has realized **$736,000** across 6 completed missions, logging **350.5 drone flight hours** with 23 certified remote pilots deployed.
- **Operational Friction Index:** 2 critical work orders currently face execution drag totaling **$170,000** in delayed realization due to seasonal monsoon weather holds and DGCA airport perimeter NOTAM clearances.

---

### 2. Sectoral Performance Breakdown
| Sector | Active Pipeline | Won Bookings | Completed WOs | Avg Turnaround (TAT) | Health Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Renewable & Energy** | $340,000 | $400,000 | 2 Completed | 15.0 days | 🟡 Monitor (Weather) |
| **Mining & Resources** | $250,000 | $205,000 | 1 Completed | 9.0 days | 🟢 High Velocity |
| **Infrastructure & Rail** | $330,000 | $140,000 | 1 Completed | 27.0 days | 🔴 Delay (DGCA/Admin) |
| **Telecom & Towers** | $240,000 | $65,000 | 1 Completed | 43.0 days | 🟢 Complete |
| **Agriculture & Forestry** | $0 | $60,000 | 1 Completed | 15.0 days | 🟢 Complete |

---

### 3. Critical Blockers & At-Risk Execution
1. **NTPC Super Thermal Powerline LiDAR (WO-202):** Paused 9 days due to flash flooding and torrential monsoon rains in Madhya Pradesh. Revenue impact: **$125,000**. Mitigation: Crew staged at base camp; flights resume upon weather clearance window.
2. **NHAI Vadodara Expressway 3D Mesh (WO-211):** Airspace clearance held up by DGCA due to proximity to Vadodara civil airport buffer zone. Revenue impact: **$45,000**. Mitigation: Expedited AAI regional office coordination in progress.

---

### 4. Founder Strategic Action Items
1. **Accelerate Mining Sector Expansion:** Mining demonstrates our lowest turnaround time (9 days) and zero regulatory hurdles. Shift spare eVTOL capacity to open-cast pit volumetric contracts.
2. **Establish Pre-Clearance DGCA Protocols:** For infrastructure projects within 20km of airfields, institute parallel airspace permitting at the proposal stage rather than post-deal closing.
3. **Protect Q4 Delivery Margins:** Convert the $240k Indus Towers negotiation before end of quarter to ensure continuous pilot utilization through dry season.`);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/agent/leadership-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: updateType,
          focusPeriod,
          kpis,
          sectorMetrics,
          sampleDeals: deals,
          sampleWorkOrders: workOrders,
          dataHealth
        })
      });

      const resData = await response.json();
      if (resData.success && resData.markdown) {
        setGeneratedMarkdown(resData.markdown);
      }
    } catch (err) {
      console.error('Update generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const downloadMarkdown = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skylark_Leadership_Update_${updateType}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdfReport = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const margin = 14;
      const contentWidth = pageWidth - margin * 2; // 182mm
      let yPos = 14;

      const formatTitles: Record<string, string> = {
        weekly_digest: 'Weekly Executive Digest',
        board_deck: 'Board of Directors Synthesis',
        risk_radar: 'Operational Risk & SLA Radar',
        sector_strategy: 'Sector Performance Deep-Dive'
      };
      const currentFormatTitle = formatTitles[updateType] || 'Executive Leadership Briefing';

      // --- 1. HEADER BANNER ---
      doc.setFillColor(15, 23, 42); // slate-900 / navy
      doc.roundedRect(margin, yPos, contentWidth, 26, 3, 3, 'F');

      // Top amber accent line
      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(margin, yPos, contentWidth, 2.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(245, 158, 11);
      doc.text('SKYLARK DRONES  |  AUTONOMOUS BI & OPERATIONS INTELLIGENCE', margin + 6, yPos + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(currentFormatTitle, margin + 6, yPos + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      });
      doc.text(`Focus: ${focusPeriod}   |   Date: ${dateStr}   |   Model: Gemini 3.8 Flash`, margin + 6, yPos + 22);

      yPos += 31;

      // Helper for page break checks
      const ensureSpace = (neededHeight: number) => {
        if (yPos + neededHeight > 275) {
          doc.addPage();
          yPos = 16;
          // Mini Header on subsequent pages
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`Skylark Drones — ${currentFormatTitle} (Cont.)`, margin, yPos);
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);
          yPos += 7;
        }
      };

      // --- 2. EXECUTIVE KPI SUMMARY CARDS (6 Grid) ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Cross-Board Performance Benchmarks', margin, yPos);
      yPos += 4;

      const kpiItems = [
        {
          label: 'Total Sales Pipeline',
          val: `$${(kpis.totalPipelineValue / 1000).toFixed(0)}k`,
          sub: `${deals.length} active opportunities`,
          accent: [217, 119, 6] // amber-600
        },
        {
          label: 'Closed-Won Bookings',
          val: `$${(kpis.totalWonBookings / 1000).toFixed(0)}k`,
          sub: `${kpis.overallWinRate}% aggregate win rate`,
          accent: [5, 150, 105] // emerald-600
        },
        {
          label: 'Field Ops Realized',
          val: `$${(kpis.totalExecutedBilling / 1000).toFixed(0)}k`,
          sub: `${kpis.completedWorkOrders} delivered missions`,
          accent: [37, 99, 235] // blue-600
        },
        {
          label: 'Flight Hours Logged',
          val: `${kpis.totalFlightHoursLogged} hrs`,
          sub: `${kpis.pilotsDeployed} certified drone pilots`,
          accent: [124, 58, 237] // purple-600
        },
        {
          label: 'Revenue At Risk (Delays)',
          val: `$${(kpis.atRiskRevenue / 1000).toFixed(0)}k`,
          sub: `${kpis.delayedWorkOrders} delayed work orders`,
          accent: [225, 29, 72] // rose-600
        },
        {
          label: 'Avg Turnaround (TAT)',
          val: `${kpis.avgTurnaroundDays} days`,
          sub: 'Target SLA benchmark: 14.0d',
          accent: [71, 85, 105] // slate-600
        }
      ];

      const cardWidth = (contentWidth - 8) / 3; // 3 columns
      const cardHeight = 16;

      kpiItems.forEach((item, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const cardX = margin + col * (cardWidth + 4);
        const cardY = yPos + row * (cardHeight + 3);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

        // Color tag dot
        doc.setFillColor(item.accent[0], item.accent[1], item.accent[2]);
        doc.circle(cardX + 4, cardY + 4.5, 1.5, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(item.label, cardX + 8, cardY + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(item.val, cardX + 4, cardY + 11);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(item.sub, cardX + 4, cardY + 14.5);
      });

      yPos += (cardHeight * 2) + 10;

      // --- 3. SECTOR PERFORMANCE BREAKDOWN TABLE ---
      ensureSpace(42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Enterprise Sector Distribution & Velocity', margin, yPos);
      yPos += 4;

      // Table Header
      const colWidths = [44, 28, 28, 26, 26, 30];
      const headers = ['Sector', 'Pipeline ($)', 'Won Bookings', 'Completed WOs', 'Avg TAT', 'Health'];

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);

      let curX = margin + 2;
      headers.forEach((h, i) => {
        doc.text(h, curX, yPos + 4.2);
        curX += colWidths[i];
      });
      yPos += 6;

      // Table Rows from sectorMetrics
      sectorMetrics.forEach((sec, sIdx) => {
        ensureSpace(7);
        const isEven = sIdx % 2 === 0;
        if (isEven) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, yPos, contentWidth, 5.5, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);

        let rowX = margin + 2;
        // Sector Name
        doc.setFont('helvetica', 'bold');
        doc.text(sec.sector, rowX, yPos + 3.8);
        doc.setFont('helvetica', 'normal');
        rowX += colWidths[0];

        // Pipeline
        doc.text(`$${sec.totalPipeline.toLocaleString()}`, rowX, yPos + 3.8);
        rowX += colWidths[1];

        // Won
        doc.text(`$${sec.wonBookings.toLocaleString()}`, rowX, yPos + 3.8);
        rowX += colWidths[2];

        // Completed
        doc.text(`${sec.completedWorkOrders} missions`, rowX, yPos + 3.8);
        rowX += colWidths[3];

        // Avg TAT
        const tatStr = sec.avgTatDays ? `${sec.avgTatDays}d` : 'N/A';
        doc.text(tatStr, rowX, yPos + 3.8);
        rowX += colWidths[4];

        // Status Health
        const isWarning = sec.delayedWorkOrders > 0;
        if (isWarning) {
          doc.setTextColor(225, 29, 72);
          doc.text(`Warning (${sec.delayedWorkOrders} delayed)`, rowX, yPos + 3.8);
        } else {
          doc.setTextColor(5, 150, 105);
          doc.text('Optimal Velocity', rowX, yPos + 3.8);
        }

        yPos += 5.5;
      });

      yPos += 6;

      // --- 4. CRITICAL EXECUTION FRICTION & BOTTLENECKS ---
      ensureSpace(26);
      doc.setFillColor(254, 242, 242); // soft red box
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(margin, yPos, contentWidth, 22, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text('CRITICAL EXECUTION BLOCKERS & REVENUE AT RISK ($170,000)', margin + 4, yPos + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(127, 29, 29);
      const blockerLines = [
        '• NTPC Super Thermal Powerline LiDAR (WO-202): $125k milestone delayed 9 days by flash monsoon weather in MP.',
        '• NHAI Vadodara Expressway 3D Mesh (WO-211): $45k held due to DGCA/AAI civil airfield buffer zone permits.',
        '• Action Taken: Rapid staging at basecamp + expedited DGCA regional liaison protocol active.'
      ];
      blockerLines.forEach((line, lIdx) => {
        doc.text(line, margin + 4, yPos + 10.5 + (lIdx * 3.8));
      });

      yPos += 27;

      // --- 5. SYNTHESIZED EXECUTIVE BRIEFING NARRATIVE ---
      ensureSpace(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Strategic Narrative & Tactical Founder Levers', margin, yPos);
      yPos += 5;

      // Process markdown narrative into clean paragraphs
      const paragraphs = generatedMarkdown
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => !p.startsWith('|') && !p.startsWith('# ') && p.length > 0);

      paragraphs.forEach((para) => {
        if (para.startsWith('### ')) {
          ensureSpace(12);
          const headingText = para.replace('### ', '');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(217, 119, 6); // amber-600
          doc.text(headingText, margin, yPos);
          yPos += 4.5;
        } else if (para.startsWith('- ') || para.startsWith('1. ')) {
          const listItems = para.split('\n');
          listItems.forEach(item => {
            ensureSpace(8);
            const cleanItem = item.replace(/^[-0-9.]+\s*/, '').replace(/\*\*/g, '');
            const wrappedLines = doc.splitTextToSize(`• ${cleanItem}`, contentWidth - 4);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.2);
            doc.setTextColor(51, 65, 85);
            doc.text(wrappedLines, margin + 2, yPos);
            yPos += wrappedLines.length * 3.5 + 1.2;
          });
        } else {
          ensureSpace(10);
          const cleanText = para.replace(/\*\*/g, '');
          const wrapped = doc.splitTextToSize(cleanText, contentWidth);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(51, 65, 85);
          doc.text(wrapped, margin, yPos);
          yPos += wrapped.length * 3.5 + 2;
        }
      });

      // --- 6. PAGE NUMBERING & FOOTER ON EVERY PAGE ---
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 286, margin + contentWidth, 286);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(148, 163, 184);
        doc.text('Skylark Drones Confidential  |  Executive Leadership Intelligence Report', margin, 290.5);
        doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, 290.5, { align: 'right' });
      }

      // Download triggered
      doc.save(`Skylark_Executive_Report_${updateType}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Executive Leadership Updates Studio</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  AI Synthesized
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                1-Click C-Suite briefings, board slide narratives, and risk memos compiled from Monday.com boards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Briefing Format:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setUpdateType('weekly_digest')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  updateType === 'weekly_digest' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekly Digest
              </button>
              <button
                onClick={() => setUpdateType('board_deck')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  updateType === 'board_deck' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Board Deck
              </button>
              <button
                onClick={() => setUpdateType('risk_radar')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  updateType === 'risk_radar' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Risk Radar
              </button>
              <button
                onClick={() => setUpdateType('sector_strategy')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  updateType === 'sector_strategy' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sector Deep-Dive
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Brief'}</span>
            </button>
          </div>

        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/60 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-inner">
            <div className="prose prose-invert prose-xs max-w-none space-y-4">
              {generatedMarkdown.split('\n\n').map((block, idx) => {
                if (block.startsWith('# ')) {
                  return <h1 key={idx} className="text-lg font-bold text-white border-b border-slate-800 pb-2">{block.replace('# ', '')}</h1>;
                }
                if (block.startsWith('### ')) {
                  return <h3 key={idx} className="text-sm font-bold text-amber-400 mt-4 mb-2">{block.replace('### ', '')}</h3>;
                }
                if (block.startsWith('| ')) {
                  return (
                    <div key={idx} className="overflow-x-auto my-3">
                      <table className="w-full text-left text-[11px] border-collapse border border-slate-800">
                        <tbody>
                          {block.split('\n').filter(r => !r.includes(':---')).map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-950 font-bold text-slate-300' : 'border-t border-slate-800/80 hover:bg-slate-800/40'}>
                              {row.split('|').filter(c => c.trim() !== '').map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 border-r border-slate-800" dangerouslySetInnerHTML={{ __html: cell.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (block.startsWith('- ') || block.startsWith('1. ')) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-1.5 text-slate-300">
                      {block.split('\n').map((item, iIdx) => (
                        <li key={iIdx} dangerouslySetInnerHTML={{ __html: item.replace(/^[-0-9.]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with Export & Copy Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>Interpreted requirement: Cross-board strategic synthesized brief for leadership decisions.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              title="Download raw Markdown briefing"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download (.md)</span>
            </button>

            <button
              id="btn-download-pdf-report"
              onClick={downloadPdfReport}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
              title="Generate and download professional executive PDF report"
            >
              <FileDown className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
