import React, { useState } from 'react';
import { 
  X, Settings, Key, CheckCircle2, AlertCircle, 
  ExternalLink, RefreshCw, Database, Layers 
} from 'lucide-react';
import { MondayConnectionConfig } from '../types';

interface MondayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MondayConnectionConfig;
  onSaveConfig: (newConfig: MondayConnectionConfig) => void;
  onFetchLiveBoards: () => void;
  isFetchingLive: boolean;
}

export const MondayConfigModal: React.FC<MondayConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onFetchLiveBoards,
  isFetchingLive
}) => {
  if (!isOpen) return null;

  const [token, setToken] = useState(config.apiToken);
  const [dealBoardId, setDealBoardId] = useState(config.dealBoardId);
  const [workOrderBoardId, setWorkOrderBoardId] = useState(config.workOrderBoardId);
  const [useLiveApi, setUseLiveApi] = useState(config.useLiveApi);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!token.trim()) {
      setTestResult({ success: false, message: 'Please provide a Monday.com Personal API Token first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/monday/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: token.trim() })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setTestResult({
          success: true,
          message: `Connected successfully as "${data.user.name}" (${data.user.email}) via Monday.com GraphQL API v2.`
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Verify API token permissions in Monday.com.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error connecting to Monday.com API.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      apiToken: token.trim(),
      dealBoardId: dealBoardId.trim(),
      workOrderBoardId: workOrderBoardId.trim(),
      useLiveApi,
      status: testResult?.success ? 'connected' : config.status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Monday.com API v2 Connection</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  GraphQL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure live board credentials or test using preloaded Skylark datasets
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Active Data Source Mode Toggle */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Active Data Source Mode
            </span>
            <div className="grid grid-cols-2 gap-3">
              
              <div 
                onClick={() => setUseLiveApi(false)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  !useLiveApi
                    ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    Preloaded Skylark Dataset
                  </span>
                  {!useLiveApi && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Recommended for instant testing. Includes real-world messy Deals and Work Orders reflecting actual drone operations.
                </p>
              </div>

              <div 
                onClick={() => setUseLiveApi(true)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  useLiveApi
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Live Monday.com API v2
                  </span>
                  {useLiveApi && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Queries Monday.com GraphQL endpoint dynamically using your Personal API token and target Board IDs.
                </p>
              </div>

            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Monday.com Personal API Token
                </span>
                <a 
                  href="https://auth.monday.com/oauth/token" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Where to find token</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Generated in Monday.com under Avatar → Developers → My Access Tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deals Board ID (Sales Pipeline)
                </label>
                <input
                  type="text"
                  value={dealBoardId}
                  onChange={(e) => setDealBoardId(e.target.value)}
                  placeholder="e.g., 7849201948"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Numeric ID from your Monday.com board URL.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Orders Board ID (Flight Ops)
                </label>
                <input
                  type="text"
                  value={workOrderBoardId}
                  onChange={(e) => setWorkOrderBoardId(e.target.value)}
                  placeholder="e.g., 7849201949"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Numeric ID for project execution tracker.
                </p>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !token.trim()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing GraphQL API...' : 'Test Monday API Connection'}</span>
              </button>

              {/* Test Result Feedback */}
              {testResult && (
                <div className={`mt-3 p-3 rounded-xl border flex items-start gap-2 text-xs leading-relaxed ${
                  testResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>{testResult.message}</div>
                </div>
              )}
            </div>

          </div>

          {/* Setup Help Instructions */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
            <strong className="text-white block text-xs">How to import sample files into Monday.com:</strong>
            <p>1. In Monday.com, click <strong>+ Add</strong> → <strong>Import data</strong> → <strong>Excel / CSV</strong>.</p>
            <p>2. Import <code className="text-amber-300">Deal funnel Data.xlsx</code> as one board, and <code className="text-amber-300">Work Order Tracker Data.xlsx</code> as the second board.</p>
            <p>3. Copy the numeric board IDs from your browser URL (<code className="text-slate-300 font-mono">boards/1234567890</code>) into the fields above.</p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
