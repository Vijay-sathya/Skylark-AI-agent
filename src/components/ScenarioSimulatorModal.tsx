import React, { useState } from 'react';
import { 
  X, Sparkles, TrendingUp, Sliders, ShieldCheck, 
  Clock, Users, ArrowRight, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { ExecutiveKPIs } from '../types';

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpis: ExecutiveKPIs;
  onApplyScenarioToChat: (scenarioText: string, scenarioData: any) => void;
}

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  kpis,
  onApplyScenarioToChat
}) => {
  const [tatDelta, setTatDelta] = useState<number>(-3); // -3 days TAT compression
  const [pipelineBoost, setPipelineBoost] = useState<number>(20); // +20% win rate
  const [clearMonsoon, setClearMonsoon] = useState<boolean>(true); // clear NTPC delay
  const [pilotChange, setPilotChange] = useState<number>(2); // +2 pilots
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/agent/simulate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseKpis: kpis,
          tatDeltaDays: tatDelta,
          pipelineWinRateBoost: pipelineBoost,
          monsoonDelayCleared: clearMonsoon,
          pilotMobilizationChange: pilotChange
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.simulation);
      }
    } catch (e) {
      console.error('Simulation failed:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendToChat = () => {
    if (!simResult) return;
    const promptText = `Simulate What-If Scenario: Compressing TAT by ${Math.abs(tatDelta)} days, ${clearMonsoon ? 'clearing monsoon weather delays' : 'maintaining weather delays'}, boosting pipeline conversion by +${pipelineBoost}%, and deploying ${pilotChange >= 0 ? '+' : ''}${pilotChange} pilots.`;
    onApplyScenarioToChat(promptText, simResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Executive What-If Scenario Simulator
                <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                  Predictive Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Model flight operations, SLA turnarounds, weather recovery, and revenue recognition.
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* TAT Compression Slider */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  TAT Operational Delta
                </label>
                <span className={`text-xs font-mono font-bold ${tatDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tatDelta > 0 ? `+${tatDelta}` : tatDelta} days
                </span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="1"
                value={tatDelta}
                onChange={(e) => setTatDelta(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>-6d (Express delivery)</span>
                <span>Baseline (15d)</span>
                <span>+6d (Severe lag)</span>
              </div>
            </div>

            {/* Pipeline Win Rate Boost */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Pipeline Conversion Lift
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{pipelineBoost}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={pipelineBoost}
                onChange={(e) => setPipelineBoost(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0% (Status quo)</span>
                <span>+25% (Strong close)</span>
                <span>+50% (Max win)</span>
              </div>
            </div>

            {/* Pilot Staffing Change */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Pilot Fleet Mobilization
                </label>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {pilotChange >= 0 ? `+${pilotChange}` : pilotChange} pilots
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="8"
                step="1"
                value={pilotChange}
                onChange={(e) => setPilotChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>-4 (Contraction)</span>
                <span>Current (23)</span>
                <span>+8 (Rapid surge)</span>
              </div>
            </div>

            {/* Monsoon Weather Hold Clearance Toggle */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Monsoon Clearance (NTPC)</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Unlock $125k LiDAR mission held in MP
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setClearMonsoon(!clearMonsoon)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    clearMonsoon ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md"></div>
                </button>
              </div>
              <span className="text-[10px] text-amber-400/90 font-medium mt-2">
                {clearMonsoon ? '✓ Weather hold lifted: Reclaims $125k revenue' : '✗ Weather hold continues: Revenue remains at risk'}
              </span>
            </div>

          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              Run Predictive Simulation
            </button>
            <span className="text-xs text-slate-500">
              Correlating 14 Deals & 8 Work Orders dynamically
            </span>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-4.5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Simulated Strategic Outcome
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  On-Time Fulfillment: <strong className="text-emerald-400">{simResult.onTimeRate}%</strong>
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Projected Won</span>
                  <span className="text-base font-bold text-emerald-400 block mt-0.5">
                    ${(simResult.projectedWon / 1000).toFixed(0)}k
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    +${(simResult.deltaWon / 1000).toFixed(0)}k vs base
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Simulated TAT</span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    {simResult.tat} days
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Target SLA: 14d
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">At-Risk Revenue</span>
                  <span className="text-base font-bold text-amber-300 block mt-0.5">
                    ${(simResult.atRiskRevenue / 1000).toFixed(0)}k
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {simResult.deltaAtRisk < 0 ? `-$${Math.abs(simResult.deltaAtRisk / 1000).toFixed(0)}k risk` : 'No risk change'}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Pilots Active</span>
                  <span className="text-base font-bold text-blue-400 block mt-0.5">
                    {simResult.pilotsAvailable}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Field capacity
                  </span>
                </div>
              </div>

              {/* Verdict text */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200 leading-relaxed">
                <strong>Executive Takeaway:</strong> {simResult.verdict}
              </div>

              {/* Submit to chat button */}
              <button
                onClick={handleSendToChat}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inject Scenario Into AI Agent Conversation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
