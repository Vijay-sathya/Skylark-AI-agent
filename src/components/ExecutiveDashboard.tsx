import React, { useState } from 'react';
import { 
  TrendingUp, Clock, AlertTriangle, ShieldCheck, DollarSign, 
  Plane, BarChart2, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Filter, Layers, Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { CleanDeal, CleanWorkOrder, ExecutiveKPIs } from '../types';
import { SectorMetric, getCrossBoardCorrelation } from '../lib/analyticsEngine';

interface ExecutiveDashboardProps {
  deals: CleanDeal[];
  workOrders: CleanWorkOrder[];
  kpis: ExecutiveKPIs;
  sectorMetrics: SectorMetric[];
  onOpenLeadershipUpdates: () => void;
  onOpenDataHealth: () => void;
  onNavigateToAgent?: () => void;
}

const SECTOR_COLORS: { [key: string]: string } = {
  'Renewable & Energy': '#f59e0b',
  'Mining & Resources': '#10b981',
  'Infrastructure & Rail': '#3b82f6',
  'Telecom & Towers': '#8b5cf6',
  'Agriculture & Forestry': '#ec4899',
  'Other Enterprise': '#64748b'
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  deals,
  workOrders,
  kpis,
  sectorMetrics,
  onOpenLeadershipUpdates,
  onOpenDataHealth,
  onNavigateToAgent
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const crossBoardData = getCrossBoardCorrelation(deals, workOrders);

  const filteredDeals = selectedSector === 'ALL' 
    ? deals 
    : deals.filter(d => d.normalizedSector === selectedSector);

  const filteredWOs = selectedSector === 'ALL'
    ? workOrders
    : workOrders.filter(w => w.normalizedSector === selectedSector);

  const sectorChartData = sectorMetrics.map(s => ({
    name: s.sector.replace(' & ', ' + ').slice(0, 16),
    pipeline: s.totalPipeline,
    won: s.wonBookings,
    billing: s.executedBilling
  }));

  const woStatusData = [
    { name: 'Completed', count: workOrders.filter(w => w.isCompleted).length, color: '#10b981' },
    { name: 'In Progress', count: workOrders.filter(w => w.normalizedStatus === 'In Progress').length, color: '#3b82f6' },
    { name: 'Delayed (Weather/Permits)', count: workOrders.filter(w => w.isDelayed).length, color: '#f43f5e' },
    { name: 'Scheduled', count: workOrders.filter(w => w.normalizedStatus === 'Scheduled').length, color: '#eab308' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            Executive Business Intelligence Command
          </h2>
          <p className="text-xs text-slate-400">
            Synthesized across Deals Funnel and Work Order Operations • Real-Time Resilience Layer Active
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sector Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Enterprise Sectors</option>
              {sectorMetrics.map(s => (
                <option key={s.sector} value={s.sector}>{s.sector}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenLeadershipUpdates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Leadership Brief</span>
          </button>
        </div>
      </div>

      {/* Autonomous AI Agent Live Briefing Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                Autonomous AI Agent Insight
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-mono">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              <strong>Bottleneck Detected:</strong> 2 Won Deals ($170k) have stalled in delivery due to NTPC monsoon hold and NHAI Vadodara airport buffer permit.
            </p>
          </div>
        </div>

        {onNavigateToAgent && (
          <button
            onClick={onNavigateToAgent}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            <span>Consult AI Agent</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Pipeline */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Pipeline</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            ${(kpis.totalPipelineValue / 1000).toFixed(0)}k
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>{kpis.activePipelineDeals} active proposals</span>
          </div>
        </div>

        {/* Won Bookings */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Won Bookings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            ${(kpis.totalWonBookings / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Win Rate: <span className="text-emerald-300 font-semibold">{kpis.overallWinRate}%</span>
          </div>
        </div>

        {/* Executed Billing */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Realized Billing</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-blue-400">
            ${(kpis.totalExecutedBilling / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {kpis.completedWorkOrders} completed missions
          </div>
        </div>

        {/* Average TAT */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Turnaround</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {kpis.avgTurnaroundDays} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target SLA: 14 days
          </div>
        </div>

        {/* Flight Hours Logged */}
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Drone Hours</span>
            <Plane className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-indigo-300">
            {kpis.totalFlightHoursLogged} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across {kpis.pilotsDeployed} deployed pilots
          </div>
        </div>

        {/* Delayed / At-Risk Revenue */}
        <div className="bg-slate-900/80 border border-rose-900/40 p-4 rounded-2xl shadow-lg bg-gradient-to-b from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-rose-300">At-Risk Revenue</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400">
            ${(kpis.atRiskRevenue / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-rose-300/80 mt-1">
            {kpis.delayedWorkOrders} delayed work orders
          </div>
        </div>

      </div>

      {/* Main Visualizations: Sector Pipeline vs Ops Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sector Pipeline vs Won Bookings Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Sectoral Pipeline vs Booked Bookings</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Cross-Industry
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Comparison of active pipeline opportunities against closed-won revenue
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold">USD</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v/1000}k`} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="pipeline" name="Active Pipeline" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="won" name="Won Bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="billing" name="Realized Billing" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Work Order Execution Status Donut */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Field Execution Status (Work Orders)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time operational status across active missions
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={woStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {woStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {woStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Cross-Board Correlation Table: Deals Won vs Work Order Execution */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cross-Board Deal-to-Delivery Correlation</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Deals ↔ Work Orders
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tracking fulfillment of closed-won deals against field work order milestones
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {crossBoardData.length} Won Deals Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Deal / Client</th>
                <th className="pb-3 font-semibold">Sector</th>
                <th className="pb-3 font-semibold">Deal Value</th>
                <th className="pb-3 font-semibold">Work Orders</th>
                <th className="pb-3 font-semibold">Execution Status</th>
                <th className="pb-3 font-semibold">Turnaround / Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {crossBoardData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-white">{item.clientName}</div>
                    <div className="text-[11px] text-slate-400">{item.dealName}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {item.sector}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono font-bold text-slate-200">
                    ${item.dealValue.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col gap-1">
                      {item.workOrders.map((wo, wIdx) => (
                        <span key={wIdx} className="font-mono text-[11px] text-slate-300">
                          {wo.woNumber}
                        </span>
                      ))}
                      {item.workOrders.length === 0 && (
                        <span className="text-amber-400 text-[11px] italic">No active WO kickoff</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      item.executionStatus === 'Fully Delivered'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : item.hasDelays
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.executionStatus === 'Fully Delivered' ? 'bg-emerald-400' : item.hasDelays ? 'bg-rose-400' : 'bg-blue-400'
                      }`} />
                      {item.executionStatus}
                    </span>
                  </td>
                  <td className="py-3 text-[11px]">
                    {item.hasDelays ? (
                      <span className="text-rose-300 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                        {item.delayReason || 'Operational delay'}
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Delivered on-time
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
