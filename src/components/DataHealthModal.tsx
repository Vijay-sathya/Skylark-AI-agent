import React from 'react';
import { 
  X, ShieldCheck, AlertTriangle, Info, CheckCircle2, 
  ArrowRight, Database, Download 
} from 'lucide-react';
import { DataHealthReport } from '../types';

interface DataHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataHealth: DataHealthReport;
}

export const DataHealthModal: React.FC<DataHealthModalProps> = ({
  isOpen,
  onClose,
  dataHealth
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Data Resilience & Hygiene Audit</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  {dataHealth.completenessScore}% Completeness Score
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Skylark Drones Real-World Messy Data Ingestion • Normalization & Fallback Log
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

        {/* Audit Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Top Score & Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Total Ingested</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {dataHealth.totalDeals + dataHealth.totalWorkOrders} Records
              </span>
              <span className="text-[10px] text-slate-500">{dataHealth.totalDeals} Deals, {dataHealth.totalWorkOrders} WOs</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Sector Normalizations</span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">
                {dataHealth.sectorNormalizationCount} Normalized
              </span>
              <span className="text-[10px] text-slate-500">Typos & Colloquialisms</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Date Normalizations</span>
              <span className="text-base font-bold text-blue-400 mt-0.5 block">
                {dataHealth.dateNormalizationCount} Resolved
              </span>
              <span className="text-[10px] text-slate-500">Multi-format & Quarters</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Currency Standardized</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                {dataHealth.currencyNormalizationCount} Converted
              </span>
              <span className="text-[10px] text-slate-500">INR / $k → USD Standard</span>
            </div>
          </div>

          {/* Detailed Cleaning Operations Breakdown */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Active Resilience & Fallback Rules
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Sector Taxonomies:</strong>
                  Standardized messy variations like <code className="text-amber-300 font-mono">"energy"</code>, <code className="text-amber-300 font-mono">"Renewable & Energy"</code>, <code className="text-amber-300 font-mono">"Power & Utilities"</code> into unified canonical sector <code className="text-emerald-300 font-mono">"Renewable & Energy"</code>, and corrected typo <code className="text-amber-300 font-mono">"minig"</code> to <code className="text-emerald-300 font-mono">"Mining & Resources"</code>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Multi-Format Date Ingestion:</strong>
                  Recognized DD/MM/YYYY (<code className="text-amber-300 font-mono">15/08/2024</code>), MM/DD/YYYY (<code className="text-amber-300 font-mono">06/20/2024</code>), relative quarters (<code className="text-amber-300 font-mono">"Q3 2024"</code>), and text months (<code className="text-amber-300 font-mono">"Aug 24"</code>). Aligned all records to ISO dates with quarter indexing.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Multi-Currency & Missing Value Imputation:</strong>
                  Converted Indian enterprise contracts in ₹ Lakhs/Crores to standard USD (1 USD = 83 INR). For exploratory deals marked <code className="text-amber-300 font-mono">"TBD"</code>, applied stage-median imputation with explicit user caveats so pipeline models remain unbroken.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Cross-Board Orphan Handling (Emergency MSAs):</strong>
                  Detected 1 Work Order (<code className="text-amber-300 font-mono">SKL-WO-2024-099</code> Adani Transmission) that executed as an emergency callout under master contract without an upfront deal funnel entry. Preserved in operational analytics rather than dropping.
                </div>
              </div>
            </div>
          </div>

          {/* Active Data Caveats List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              User-Facing Audit Caveats
            </h3>
            <div className="space-y-2">
              {dataHealth.caveatsList.map((cav, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    cav.type === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                  }`}>
                    {cav.category}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-300 text-xs leading-relaxed">{cav.message}</p>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Affected {cav.affectedRecordCount} records in pipeline
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <span className="text-xs text-slate-400">
            Resilience layer safeguards pipeline analytics against real-world data corruption
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
