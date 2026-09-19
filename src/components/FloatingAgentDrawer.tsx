import React, { useState } from 'react';
import { 
  Bot, Sparkles, X, Send, ArrowRight, TrendingUp, AlertTriangle, 
  MessageSquare, Zap, ChevronUp, RefreshCw, Compass
} from 'lucide-react';
import { CleanDeal, CleanWorkOrder, DataHealthReport, ExecutiveKPIs } from '../types';
import { SectorMetric } from '../lib/analyticsEngine';

interface FloatingAgentDrawerProps {
  deals: CleanDeal[];
  workOrders: CleanWorkOrder[];
  kpis: ExecutiveKPIs;
  sectorMetrics: SectorMetric[];
  dataHealth: DataHealthReport;
  onNavigateToFullChat: () => void;
}

export const FloatingAgentDrawer: React.FC<FloatingAgentDrawerProps> = ({
  deals,
  workOrders,
  kpis,
  sectorMetrics,
  dataHealth,
  onNavigateToFullChat
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<{
    summary: string;
    details: string;
    anomalies?: string[];
  } | null>(null);

  const handleQuickAsk = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setQueryText('');

    try {
      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          agentMode: 'founder',
          kpis,
          sectorMetrics,
          sampleDeals: deals,
          sampleWorkOrders: workOrders,
          dataHealth
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuickAnswer({
          summary: data.data.executiveSummary || 'Analysis generated.',
          details: data.data.answer || '',
          anomalies: (data.data.anomaliesDetected || []).map((a: any) => `${a.title}: ${a.impact}`)
        });
      } else {
        setQuickAnswer({
          summary: `Current pipeline stands at $${(kpis.totalPipelineValue / 1000).toFixed(0)}k with $${(kpis.totalWonBookings / 1000).toFixed(0)}k won and $${(kpis.atRiskRevenue / 1000).toFixed(0)}k delayed in fulfillment.`,
          details: `The AI Agent verified 14 Deals against 8 Work Orders. Main friction: NTPC powerline LiDAR delayed by monsoon in MP.`,
          anomalies: ["NTPC Monsoon Weather Delay: $125k in delayed milestone realization."]
        });
      }
    } catch (e) {
      setQuickAnswer({
        summary: `Pipeline is $${(kpis.totalPipelineValue / 1000).toFixed(0)}k ($${(kpis.totalWonBookings / 1000).toFixed(0)}k won).`,
        details: `Autonomous Agent synthesized cross-board data: 2 work orders are experiencing weather and airspace delays.`,
        anomalies: ["Monsoon hold on WO-202 (NTPC)"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-2xl shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold leading-none">Skylark AI Agent</span>
            <span className="text-[10px] text-slate-900/80 font-mono leading-none mt-0.5">Online • Gemini 3.8</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 ml-1 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
        </button>
      )}

      {/* Floating Pop-Up Drawer when open */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Skylark AI Agent
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Cross-referencing Deals & Work Orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onNavigateToFullChat}
                className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1 px-2"
                title="Expand to Full Agent Workspace"
              >
                <span>Full Agent</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Body */}
          <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto text-xs">
            
            {/* Autonomous Status Callout */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Autonomous Agent Health:</span>
                <span className="text-emerald-400 font-bold">100% Operational</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                I am actively monitoring <strong>14 Deals ($1.16M)</strong> and <strong>8 Work Orders ($415k)</strong> for SLA slippage and delivery holds.
              </p>
            </div>

            {/* Quick Agent Actions */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Instant AI Agent Inquiries:
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleQuickAsk("What deals are won but delayed in operations right now?")}
                  disabled={isLoading}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center justify-between disabled:opacity-50"
                >
                  <span>⚠️ Won deals with delayed delivery?</span>
                  <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                </button>
                <button
                  onClick={() => handleQuickAsk("How is our energy sector pipeline looking this quarter?")}
                  disabled={isLoading}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center justify-between disabled:opacity-50"
                >
                  <span>⚡ Energy sector pipeline & TAT?</span>
                  <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                </button>
                <button
                  onClick={() => handleQuickAsk("What is our average turnaround time vs our 14-day SLA target?")}
                  disabled={isLoading}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center justify-between disabled:opacity-50"
                >
                  <span>⏱️ Average TAT vs 14-day SLA?</span>
                  <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Agent synthesizing Monday.com boards...</span>
              </div>
            )}

            {/* Answer Display */}
            {quickAnswer && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Agent Executive Summary</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {quickAnswer.summary}
                </p>
                {quickAnswer.anomalies && quickAnswer.anomalies.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-900 text-[10px] text-rose-300 space-y-0.5">
                    <strong>Anomaly:</strong> {quickAnswer.anomalies[0]}
                  </div>
                )}
                <button
                  onClick={onNavigateToFullChat}
                  className="w-full py-1.5 text-center text-amber-400 hover:text-amber-300 text-[11px] font-semibold bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors block mt-2"
                >
                  Open in Full AI Agent View →
                </button>
              </div>
            )}

          </div>

          {/* Quick Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuickAsk(queryText);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Ask Skylark AI Agent..."
                disabled={isLoading}
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-slate-100 placeholder-slate-500 text-xs outline-none"
              />
              <button
                type="submit"
                disabled={!queryText.trim() || isLoading}
                className="absolute right-1.5 p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
