import React, { useState, useRef } from 'react';
import { 
  Database, Search, Filter, ShieldCheck, AlertTriangle, 
  ArrowRight, FileSpreadsheet, Download, RefreshCw, CheckCircle2,
  Upload, FileUp, Info, HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CleanDeal, CleanWorkOrder, DataHealthReport, RawDeal, RawWorkOrder } from '../types';

interface DatasetExplorerProps {
  deals: CleanDeal[];
  workOrders: CleanWorkOrder[];
  dataHealth: DataHealthReport;
  onOpenDataHealth: () => void;
  onUpdateDeals?: (deals: RawDeal[]) => void;
  onUpdateWorkOrders?: (wos: RawWorkOrder[]) => void;
  onResetData?: () => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  deals,
  workOrders,
  dataHealth,
  onOpenDataHealth,
  onUpdateDeals,
  onUpdateWorkOrders,
  onResetData
}) => {
  const [boardTab, setBoardTab] = useState<'deals' | 'workOrders'>('deals');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyCaveats, setShowOnlyCaveats] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const dealsFileInputRef = useRef<HTMLInputElement>(null);
  const wosFileInputRef = useRef<HTMLInputElement>(null);

  const filteredDeals = deals.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.normalizedSector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showOnlyCaveats) {
      return matchesSearch && d.caveats.length > 0;
    }
    return matchesSearch;
  });

  const filteredWOs = workOrders.filter(w => {
    const matchesSearch = 
      w.woNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.normalizedSector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (showOnlyCaveats) {
      return matchesSearch && w.caveats.length > 0;
    }
    return matchesSearch;
  });

  // Handle Excel Upload for Deal Funnel
  const handleUploadDeals = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (rows.length > 0) {
          const mappedDeals: RawDeal[] = rows.map((r, idx) => ({
            id: r['Deal ID'] || r['id'] || `DEAL-${101 + idx}`,
            name: r['Deal Name'] || r['name'] || 'Untitled Deal',
            clientName: r['Client Name'] || r['clientName'] || r['Account'] || 'Unnamed Client',
            sector: r['Sector'] || r['Industry'] || r['sector'] || 'General',
            dealValue: r['Deal Value'] || r['dealValue'] || r['Amount'] || 0,
            stage: r['Stage'] || r['stage'] || 'Discovery',
            expectedCloseDate: r['Expected Close Date'] || r['expectedCloseDate'] || '',
            actualCloseDate: r['Actual Close Date'] || r['actualCloseDate'] || '',
            probability: r['Probability'] || r['probability'] || 50,
            owner: r['Deal Owner'] || r['owner'] || 'Unassigned',
            region: r['Region'] || r['region'] || 'India',
            notes: r['Notes'] || r['notes'] || ''
          }));

          if (onUpdateDeals) {
            onUpdateDeals(mappedDeals);
            setUploadStatus(`Successfully parsed ${mappedDeals.length} deals from "${file.name}"!`);
            setTimeout(() => setUploadStatus(null), 4000);
          }
        }
      } catch (err: any) {
        setUploadStatus(`Failed to parse Excel file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Excel Upload for Work Orders
  const handleUploadWorkOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (rows.length > 0) {
          const mappedWOs: RawWorkOrder[] = rows.map((r, idx) => ({
            id: r['WO ID'] || r['id'] || `WO-${201 + idx}`,
            woNumber: r['WO Number'] || r['woNumber'] || `SKL-WO-2024-${100 + idx}`,
            dealId: r['Deal ID'] || r['dealId'] || '',
            clientName: r['Client Name'] || r['clientName'] || 'Unnamed Client',
            sector: r['Sector'] || r['sector'] || 'General',
            serviceType: r['Service Type'] || r['serviceType'] || 'Drone Survey',
            status: r['Status'] || r['status'] || 'In Progress',
            startDate: r['Start Date'] || r['startDate'] || '',
            targetDeliveryDate: r['Target Delivery Date'] || r['targetDeliveryDate'] || '',
            actualDeliveryDate: r['Actual Delivery Date'] || r['actualDeliveryDate'] || '',
            pilotsAssigned: Number(r['Pilots Assigned'] || r['pilotsAssigned'] || 1),
            flightHoursLogged: Number(r['Flight Hours Logged'] || r['flightHoursLogged'] || 0),
            billingValue: r['Billing Value'] || r['billingValue'] || 0,
            delayReason: r['Delay Reason'] || r['delayReason'] || '',
            dronesDeployed: r['Drones Deployed'] || r['dronesDeployed'] || 'Standard Drone Fleet',
            location: r['Location'] || r['location'] || 'Site Location',
            notes: r['Notes'] || r['notes'] || ''
          }));

          if (onUpdateWorkOrders) {
            onUpdateWorkOrders(mappedWOs);
            setUploadStatus(`Successfully parsed ${mappedWOs.length} work orders from "${file.name}"!`);
            setTimeout(() => setUploadStatus(null), 4000);
          }
        }
      } catch (err: any) {
        setUploadStatus(`Failed to parse Excel file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const exportDataJson = () => {
    const dataToExport = {
      deals,
      workOrders,
      healthReport: dataHealth,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skylark_monday_cleaned_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcelSheet = () => {
    const wb = XLSX.utils.book_new();
    const wsDeals = XLSX.utils.json_to_sheet(deals.map(d => ({
      'Deal ID': d.id,
      'Deal Name': d.name,
      'Client Name': d.clientName,
      'Normalized Sector': d.normalizedSector,
      'Clean Value (USD)': d.normalizedValue,
      'Normalized Stage': d.normalizedStage,
      'Close Date': d.actualCloseDate || d.expectedCloseDate || '',
      'Close Quarter': d.quarter || '',
      'Probability': d.probability,
      'Owner': d.owner,
      'Region': d.region,
      'Data Caveats': d.caveats.join('; ')
    })));
    
    const wsWOs = XLSX.utils.json_to_sheet(workOrders.map(w => ({
      'WO ID': w.id,
      'WO Number': w.woNumber,
      'Matched Deal ID': w.dealId,
      'Client Name': w.clientName,
      'Normalized Sector': w.normalizedSector,
      'Service Type': w.serviceType,
      'Normalized Status': w.normalizedStatus,
      'Start Date': w.startDate || '',
      'Target Delivery Date': w.targetDeliveryDate || '',
      'Actual Delivery Date': w.actualDeliveryDate || '',
      'Turnaround Days (TAT)': w.turnaroundDays,
      'Is Delayed': w.isDelayed ? 'YES' : 'NO',
      'Pilots Assigned': w.pilotsAssigned,
      'Flight Hours': w.flightHoursLogged,
      'Clean Billing Value (USD)': w.billingValue,
      'Location': w.location,
      'Delay Reason': w.delayReason || '',
      'Data Caveats': w.caveats.join('; ')
    })));

    XLSX.utils.book_append_sheet(wb, wsDeals, "Cleaned Deals Funnel");
    XLSX.utils.book_append_sheet(wb, wsWOs, "Cleaned Work Orders");
    XLSX.writeFile(wb, `skylark_bi_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Excel Origin & Ingestion Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Monday.com Source Datasets & Excel Files
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  Verified Ingestion
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pre-loaded from Skylark Drones Monday.com technical assessment exports: <strong>Deal funnel Data.xlsx</strong> & <strong>Work_Order_Tracker Data.xlsx</strong>
              </p>
            </div>
          </div>

          {/* Quick upload / reset actions */}
          <div className="flex items-center gap-2">
            {onResetData && (
              <button
                onClick={onResetData}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Reset to original sample data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            )}
            <button
              onClick={exportExcelSheet}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Both Source Files Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* File 1: Deal funnel Data.xlsx */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Deal funnel Data.xlsx
                </span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Board #7849201948
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Contains sales pipeline opportunities across Energy, Mining, Infrastructure, and Agriculture. Accounts for multi-currency values (INR/USD), pipeline stages, and close dates.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mb-3">
                <span>Loaded: <strong className="text-white">{deals.length} deals</strong></span>
                <span>Won: <strong className="text-emerald-400">{deals.filter(d => d.normalizedStage === 'Closed Won').length}</strong></span>
                <span>Active: <strong className="text-amber-400">{deals.filter(d => d.normalizedStage !== 'Closed Won' && d.normalizedStage !== 'Closed Lost').length}</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <input
                ref={dealsFileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleUploadDeals}
                className="hidden"
              />
              <button
                onClick={() => dealsFileInputRef.current?.click()}
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-500/20 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New "Deal funnel Data.xlsx"</span>
              </button>
            </div>
          </div>

          {/* File 2: Work_Order_Tracker Data.xlsx */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  Work_Order_Tracker Data.xlsx
                </span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Board #7849201949
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Tracks flight operations, pilot assignments, drone hardware, delivery dates, flight hours, and weather/airspace delay logs.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mb-3">
                <span>Loaded: <strong className="text-white">{workOrders.length} missions</strong></span>
                <span>Completed: <strong className="text-emerald-400">{workOrders.filter(w => w.normalizedStatus === 'Completed').length}</strong></span>
                <span>Delayed: <strong className="text-rose-400">{workOrders.filter(w => w.isDelayed).length}</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <input
                ref={wosFileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleUploadWorkOrders}
                className="hidden"
              />
              <button
                onClick={() => wosFileInputRef.current?.click()}
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-500/20 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New "Work_Order_Tracker Data.xlsx"</span>
              </button>
            </div>
          </div>

        </div>

        {/* Upload status message */}
        {uploadStatus && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            Monday.com Board Ingestion & Hygiene Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Inspect raw inputs side-by-side with normalized data, audit caveats, and verify resilience rules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDataHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Resilience Audit</span>
          </button>
          <button
            onClick={exportDataJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Clean JSON</span>
          </button>
        </div>
      </div>

      {/* Board Selector Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setBoardTab('deals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              boardTab === 'deals'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Deals Funnel Board (Deal funnel Data.xlsx)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              boardTab === 'deals' ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}>
              {deals.length}
            </span>
          </button>

          <button
            onClick={() => setBoardTab('workOrders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              boardTab === 'workOrders'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Work Orders Board (Work_Order_Tracker Data.xlsx)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              boardTab === 'workOrders' ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}>
              {workOrders.length}
            </span>
          </button>
        </div>

        {/* Search & Filter Toggles */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records, accounts, owners..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setShowOnlyCaveats(!showOnlyCaveats)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showOnlyCaveats
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Only Caveats ({boardTab === 'deals' ? dataHealth.dealsWithCaveats : dataHealth.wosWithCaveats})</span>
          </button>
        </div>

      </div>

      {/* Main Table View */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {boardTab === 'deals' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Deal ID / Name</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Sector (Raw → Clean)</th>
                  <th className="py-3 px-4">Value (Raw → USD)</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Close Date</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Data Resilience Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{deal.name}</span>
                      <span className="text-slate-500 text-[10px]">{deal.id}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200 font-medium">{deal.clientName}</td>
                    <td className="py-3 px-4">
                      <span className="text-slate-400 block line-through text-[10px]">{deal.originalSector}</span>
                      <span className="text-amber-400 font-semibold">{deal.normalizedSector}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-400 block line-through text-[10px]">{deal.originalValue}</span>
                      <span className="text-emerald-400 font-bold">${deal.normalizedValue.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        deal.normalizedStage === 'Closed Won'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : deal.normalizedStage === 'Closed Lost'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {deal.normalizedStage}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 block">{deal.actualCloseDate || deal.expectedCloseDate || 'TBD'}</span>
                      {deal.quarter && (
                        <span className="text-slate-500 text-[10px]">{deal.quarter}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">{deal.owner}</td>
                    <td className="py-3 px-4 font-sans">
                      {deal.caveats.length > 0 ? (
                        <div className="space-y-1">
                          {deal.caveats.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Clean Record
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">WO Number / Deal</th>
                  <th className="py-3 px-4">Client & Sector</th>
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Delivery & TAT</th>
                  <th className="py-3 px-4">Flight Hrs / Pilots</th>
                  <th className="py-3 px-4">Billing USD</th>
                  <th className="py-3 px-4">Data Resilience Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredWOs.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{wo.woNumber}</span>
                      <span className="text-amber-400 text-[10px]">{wo.dealId || 'Unlinked'}</span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-slate-200 font-medium block">{wo.clientName}</span>
                      <span className="text-slate-400 text-[10px]">{wo.normalizedSector}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">{wo.serviceType}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        wo.normalizedStatus === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : wo.normalizedStatus === 'Delayed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {wo.normalizedStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 block">
                        {wo.actualDeliveryDate || wo.targetDeliveryDate || 'TBD'}
                      </span>
                      <span className={`text-[10px] font-bold ${wo.isDelayed ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {wo.turnaroundDays ? `${wo.turnaroundDays}d turnaround` : 'In Progress'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="block">{wo.flightHoursLogged} hrs</span>
                      <span className="text-[10px] text-slate-500">{wo.pilotsAssigned} pilots</span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      ${wo.billingValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {wo.caveats.length > 0 ? (
                        <div className="space-y-1">
                          {wo.caveats.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Clean Record
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
