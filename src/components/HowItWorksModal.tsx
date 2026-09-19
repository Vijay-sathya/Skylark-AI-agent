import React, { useState } from 'react';
import { 
  X, Sparkles, Database, Bot, ArrowRight, CheckCircle2, 
  Sliders, FileText, Cpu, ShieldCheck, Zap, Compass, 
  Layers, Clock, BarChart3, HelpCircle, Terminal, RefreshCw
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
  onOpenLeadershipUpdates?: () => void;
  onOpenDataHealth?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  onOpenLeadershipUpdates,
  onOpenDataHealth
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'steps' | 'personas' | 'queries'>('overview');

  if (!isOpen) return null;

  const sampleQueries = [
    {
      label: "Energy Sector Pipeline & Flight Execution",
      query: "How's our pipeline looking for the energy sector this quarter?",
      badge: "Cross-Board",
      description: "Correlates $585k in energy proposals with active field missions like NTPC LiDAR."
    },
    {
      label: "Turnaround Time (TAT) & SLA Analysis",
      query: "Compare booked deals vs completed work orders & turnaround times",
      badge: "Operations",
      description: "Measures actual delivery against the 14-day target benchmark."
    },
    {
      label: "Revenue at Risk & Delayed Missions",
      query: "Which clients have won deals but currently delayed work orders?",
      badge: "Risk Radar",
      description: "Isolates $170k in revenue delayed by monsoon weather or DGCA permits."
    },
    {
      label: "Flight Hours & Drone Fleet Deployment",
      query: "What is our average turnaround time and flight hours by sector?",
      badge: "Fleet Logistics",
      description: "Evaluates pilot allocation and 142+ flight hours across enterprise clients."
    },
    {
      label: "Executive Synthesis & Tactical Levers",
      query: "Summarize our top revenue risks and operational blockers for the founder",
      badge: "Founder Briefing",
      description: "Synthesizes macro revenue trends and provides 3 tactical executive levers."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Skylark Autonomous BI Agent — User Guide & Architecture
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instructions for new users: how the agent connects sales to drone operations with mathematical rigor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/50 text-xs">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSection === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🚀 Quick Start & How to Use
          </button>
          <button
            onClick={() => setActiveSection('steps')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSection === 'steps'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚙️ 4-Stage Autonomous Engine
          </button>
          <button
            onClick={() => setActiveSection('personas')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSection === 'personas'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🎭 Executive Personas
          </button>
          <button
            onClick={() => setActiveSection('queries')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSection === 'queries'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚡ Try Sample Prompts
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-xs sm:text-sm">
          
          {/* SECTION 1: QUICK START */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              
              {/* Core Concept Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-500/10 border border-amber-500/30">
                <h4 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  What makes this agent unique?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traditional BI tools keep sales and operations in separate silos. This autonomous agent continuously cross-correlates your <strong>Monday.com Deals Funnel</strong> ($1.16M across 14 deals) with your <strong>Work Order Flight Tracker</strong> (8 missions, 142 flight hours). It answers founder questions with real-time operational context—such as whether won revenue is actually being flown on schedule or held up by weather/DGCA permits.
                </p>
              </div>

              {/* 4 Interactive Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                      1
                    </div>
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">Ask in Natural Language or Voice</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Type any strategic question or click the <strong>Microphone icon</strong> to dictate using speech recognition. The agent parses sector aliases, currency conversions (₹ Lakhs to USD), and quarter date ranges automatically.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                      2
                    </div>
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">Inspect Full Autonomous Reasoning</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Zero black-box hallucinations. Expand <strong>"Show Autonomous Steps"</strong> under any answer to inspect how records were ingested, normalized, cross-referenced, and verified with exact confidence ratings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      3
                    </div>
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">Simulate "What-If" Scenarios</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click <strong>"Simulate What-If"</strong> in the top-right of the chat to dynamically test hypothetical changes: e.g., what if our drone turnaround time drops by 3 days, or win rate increases by 15%?
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                      4
                    </div>
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">1-Click Executive PDF Reports</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click <strong>"Leadership Updates"</strong> in the top navigation bar and select <strong>"Download Report"</strong> to generate a branded, multi-page executive PDF briefing with KPI grids, sector tables, and action items.
                  </p>
                </div>

              </div>

              {/* Data Safety & Zero Setup Note */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">
                    <strong>Zero-Setup Guarantee:</strong> Both Excel datasets are preloaded into memory. You can also connect live Monday.com boards anytime via the header pill.
                  </span>
                </div>
                {onOpenDataHealth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDataHealth();
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline ml-2 whitespace-nowrap"
                  >
                    View Data Health (92/100)
                  </button>
                )}
              </div>

            </div>
          )}

          {/* SECTION 2: 4-STAGE ENGINE */}
          {activeSection === 'steps' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Here is the technical architectural flow that executes every time you prompt the agent:
              </p>

              <div className="relative border-l-2 border-amber-500/40 ml-4 pl-6 space-y-6">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Stage 1</span>
                    <h5 className="font-bold text-slate-100 text-sm">Board Ingestion & Schema Alignment</h5>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Ingests <strong>Deals Funnel</strong> (opportunities, values, probabilities, close dates) and <strong>Work Order Tracker</strong> (flight hours, drones deployed, pilots, target dates, delay reasons) from Monday.com GraphQL API v2 or local cache.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">Stage 2</span>
                    <h5 className="font-bold text-slate-100 text-sm">Data Resilience & Normalization</h5>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Runs automatic hygiene rules: converts multi-currency amounts (₹ to USD at 1:83 benchmark), aligns multi-format dates (`"Aug 24"` to `2024-08-15`), standardizes sector typos (`"minig"` to `"Mining"`), and flags missing fields with transparent caveats.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Stage 3</span>
                    <h5 className="font-bold text-slate-100 text-sm">Deterministic Mathematical Computation</h5>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Calculates exact ground-truth metrics <em>before</em> calling the LLM to prevent mathematical hallucination: exact aggregate pipeline ($1.16M), won bookings ($870k), field billing ($245k), flight hours (142 hrs), and delivery turnaround times (TAT).
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold text-xs uppercase tracking-wider">Stage 4</span>
                    <h5 className="font-bold text-slate-100 text-sm">Gemini 3.8 Flash Cross-Board Synthesis</h5>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Feeds verified metrics into Gemini 3.8 Flash using structured JSON schemas. Evaluates cross-board fulfillment friction (e.g. Adani won deals vs. deployed flight missions), isolates revenue-at-risk, and generates interactive charts (Bar, Area, Pie).
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 3: PERSONAS */}
          {activeSection === 'personas' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Switch between 3 distinct executive lens modes using the top persona pills in the chat:
              </p>

              <div className="space-y-3">
                
                <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <h5 className="font-bold text-amber-300 text-sm">Founder / CEO Mode (Default)</h5>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Macro Strategic Focus
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Focuses on runway, aggregate bookings, revenue realization, ARR conversion, customer concentration, and executive decision levers. Synthesizes cross-departmental bottlenecks that impact company growth.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      <h5 className="font-bold text-blue-300 text-sm">VP of Operations Mode</h5>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Fulfillment & Fleet Focus
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Focuses on 14-day turnaround SLA compliance, active flight hours, pilot assignments, drone hardware readiness, and field execution blockers such as monsoon weather NOTAMs and DGCA airport airspace clearances.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💼</span>
                      <h5 className="font-bold text-emerald-300 text-sm">Head of Sales Mode</h5>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Pipeline & Conversion Focus
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Focuses on stage-by-stage pipeline velocity, win/loss rates, deal aging, enterprise proposal sizing, and sector-by-sector revenue contribution.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 4: TRY SAMPLE PROMPTS */}
          {activeSection === 'queries' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Click any prompt below to immediately run it through the agent:
              </p>

              <div className="space-y-2.5">
                {sampleQueries.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-200 text-xs sm:text-sm group-hover:text-amber-300 transition-colors">
                          {item.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectPrompt) onSelectPrompt(item.query);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition-all border border-amber-500/30 whitespace-nowrap"
                    >
                      <span>Ask Agent</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Skylark Drones Autonomous BI Agent v2.4</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLeadershipUpdates && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLeadershipUpdates();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Reports</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
            >
              Start Exploring
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
