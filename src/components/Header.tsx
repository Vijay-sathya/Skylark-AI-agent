import React from 'react';
import { Bot, Sparkles, Database, FileText, Settings, ShieldCheck, Download, BarChart3, AlertCircle, FolderArchive, HelpCircle } from 'lucide-react';
import { DataHealthReport, MondayConnectionConfig } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'dashboard' | 'data';
  setActiveTab: (tab: 'chat' | 'dashboard' | 'data') => void;
  dataHealth: DataHealthReport;
  mondayConfig: MondayConnectionConfig;
  onOpenDecisionLog: () => void;
  onOpenLeadershipUpdates: () => void;
  onOpenDataHealth: () => void;
  onOpenMondayConfig: () => void;
  onOpenDeliverables: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dataHealth,
  mondayConfig,
  onOpenDecisionLog,
  onOpenLeadershipUpdates,
  onOpenDataHealth,
  onOpenMondayConfig,
  onOpenDeliverables,
  onOpenHowItWorks
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10">
              <Bot className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-mono">
                  SKYLARK<span className="text-amber-400">.DRONES</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  BI Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monday.com Cross-Board Intelligence • Executive Advisor
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
              <span className="flex items-center gap-1.5">
                AI Agent
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
            </button>
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              id="nav-tab-data"
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'data'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Monday Boards</span>
            </button>
          </div>

          {/* Quick Action Badges & Modal Triggers */}
          <div className="flex items-center gap-2">
            {/* Monday Connection Status Pill */}
            <button
              id="btn-monday-config"
              onClick={onOpenMondayConfig}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                mondayConfig.useLiveApi && mondayConfig.status === 'connected'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-slate-900/80 border-slate-700/70 text-slate-300 hover:bg-slate-800'
              }`}
              title="Configure Monday.com Live API or inspect dataset source"
            >
              <span className={`w-2 h-2 rounded-full ${
                mondayConfig.useLiveApi && mondayConfig.status === 'connected'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`} />
              <span className="hidden md:inline">
                {mondayConfig.useLiveApi ? 'Monday.com Live' : 'Skylark Dataset'}
              </span>
              <Settings className="w-3 h-3 text-slate-400" />
            </button>

            {/* Data Health Completeness Score Pill */}
            <button
              id="btn-data-health"
              onClick={onOpenDataHealth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 transition-colors"
              title="View Data Resilience & Cleaning Audit"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Data Health:</span>
              <span className="font-semibold text-emerald-400">{dataHealth.completenessScore}%</span>
            </button>

            {/* Leadership Updates Generator */}
            <button
              id="btn-leadership-updates"
              onClick={onOpenLeadershipUpdates}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-sm"
              title="1-Click Leadership Executive Updates Generator"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Leadership Update</span>
            </button>

            {/* Decision Log Modal Trigger */}
            <button
              id="btn-decision-log"
              onClick={onOpenDecisionLog}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 transition-colors"
              title="Read required 2-page Decision Log"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Decision Log</span>
            </button>

            {/* How It Works Guide Trigger */}
            <button
              id="btn-header-how-it-works"
              onClick={onOpenHowItWorks}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 transition-colors"
              title="Instructions for New Users: How the Agent & Architecture Works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* Assessment Deliverables Package Trigger */}
            <button
              id="btn-deliverables"
              onClick={onOpenDeliverables}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
              title="View & Download Assessment Deliverables (Prototype, Decision Log, Source ZIP)"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Deliverables</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
