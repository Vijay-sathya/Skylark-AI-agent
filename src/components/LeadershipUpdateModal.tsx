import React, { useState } from 'react';
import { 
  X, Sparkles, Copy, Check, Download, FileText, 
  Calendar, Layers, ShieldAlert, TrendingUp, RefreshCw 
} from 'lucide-react';
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

  const downloadMarkdown = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skylark_Leadership_Update_${updateType}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download (.md)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
