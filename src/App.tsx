import React, { useState, useMemo } from 'react';
import { 
  defaultActiveDeals, 
  defaultActiveWorkOrders, 
  enterpriseDealsData, 
  enterpriseWorkOrdersData, 
  rawDealsData, 
  rawWorkOrdersData 
} from './data/sampleDataset';
import { cleanDeals, cleanWorkOrders, buildDataHealthReport } from './lib/dataCleaner';
import { computeExecutiveKPIs, computeSectorMetrics } from './lib/analyticsEngine';
import { MondayConnectionConfig, RawDeal, RawWorkOrder } from './types';
import { Header } from './components/Header';
import { AgentChat } from './components/AgentChat';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DatasetExplorer } from './components/DatasetExplorer';
import { DecisionLogModal } from './components/DecisionLogModal';
import { LeadershipUpdateModal } from './components/LeadershipUpdateModal';
import { DataHealthModal } from './components/DataHealthModal';
import { MondayConfigModal } from './components/MondayConfigModal';
import { FloatingAgentDrawer } from './components/FloatingAgentDrawer';
import { DeliverablesModal } from './components/DeliverablesModal';
import { HowItWorksModal } from './components/HowItWorksModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'data'>('chat');
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  
  // Dataset Mode & State (Default: Real Skylark Drones Enterprise Assessment Dataset)
  const [datasetMode, setDatasetMode] = useState<'enterprise' | 'demo'>('enterprise');
  const [rawDeals, setRawDeals] = useState<RawDeal[]>(defaultActiveDeals);
  const [rawWOs, setRawWOs] = useState<RawWorkOrder[]>(defaultActiveWorkOrders);

  // Monday.com Connection Config State
  const [mondayConfig, setMondayConfig] = useState<MondayConnectionConfig>({
    apiToken: '',
    dealBoardId: '7849201948',
    workOrderBoardId: '7849201949',
    useLiveApi: false,
    status: 'disconnected'
  });

  const [isFetchingLive, setIsFetchingLive] = useState(false);

  // Modal States
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [isLeadershipUpdatesOpen, setIsLeadershipUpdatesOpen] = useState(false);
  const [isDataHealthOpen, setIsDataHealthOpen] = useState(false);
  const [isMondayConfigOpen, setIsMondayConfigOpen] = useState(false);
  const [isDeliverablesOpen, setIsDeliverablesOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Cleaned and Normalized Data Memoization
  const cleanedData = useMemo(() => {
    const { deals: cleanDList, hygieneReport: dReport } = cleanDeals(rawDeals);
    const { workOrders: cleanWList, hygieneReport: wReport } = cleanWorkOrders(rawWOs);
    const healthReport = buildDataHealthReport(rawDeals, cleanDList, rawWOs, cleanWList);
    const kpis = computeExecutiveKPIs(cleanDList, cleanWList);
    const sectorMetrics = computeSectorMetrics(cleanDList, cleanWList);

    return {
      deals: cleanDList,
      workOrders: cleanWList,
      dataHealth: healthReport,
      kpis,
      sectorMetrics
    };
  }, [rawDeals, rawWOs]);

  // Live board fetching function
  const handleFetchLiveBoards = async () => {
    if (!mondayConfig.apiToken) return;
    setIsFetchingLive(true);
    try {
      const res = await fetch('/api/monday/fetch-boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken: mondayConfig.apiToken,
          dealBoardId: mondayConfig.dealBoardId,
          workOrderBoardId: mondayConfig.workOrderBoardId
        })
      });
      const data = await res.json();
      if (data.success && data.boards && data.boards.length > 0) {
        // Map Monday boards to RawDeal / RawWorkOrder
        setMondayConfig(prev => ({ ...prev, status: 'connected', lastSyncedAt: new Date().toLocaleTimeString() }));
      }
    } catch (err) {
      console.error('Failed to fetch live boards:', err);
    } finally {
      setIsFetchingLive(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataHealth={cleanedData.dataHealth}
        mondayConfig={mondayConfig}
        onOpenDecisionLog={() => setIsDecisionLogOpen(true)}
        onOpenLeadershipUpdates={() => setIsLeadershipUpdatesOpen(true)}
        onOpenDataHealth={() => setIsDataHealthOpen(true)}
        onOpenMondayConfig={() => setIsMondayConfigOpen(true)}
        onOpenDeliverables={() => setIsDeliverablesOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <AgentChat
            deals={cleanedData.deals}
            workOrders={cleanedData.workOrders}
            kpis={cleanedData.kpis}
            sectorMetrics={cleanedData.sectorMetrics}
            dataHealth={cleanedData.dataHealth}
            onOpenLeadershipUpdates={() => setIsLeadershipUpdatesOpen(true)}
            onOpenDataHealth={() => setIsDataHealthOpen(true)}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            initialPrompt={initialPrompt}
            onClearInitialPrompt={() => setInitialPrompt(null)}
          />
        )}

        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            deals={cleanedData.deals}
            workOrders={cleanedData.workOrders}
            kpis={cleanedData.kpis}
            sectorMetrics={cleanedData.sectorMetrics}
            onOpenLeadershipUpdates={() => setIsLeadershipUpdatesOpen(true)}
            onOpenDataHealth={() => setIsDataHealthOpen(true)}
            onNavigateToAgent={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'data' && (
          <DatasetExplorer
            deals={cleanedData.deals}
            workOrders={cleanedData.workOrders}
            dataHealth={cleanedData.dataHealth}
            onOpenDataHealth={() => setIsDataHealthOpen(true)}
            onUpdateDeals={(newDeals) => setRawDeals(newDeals)}
            onUpdateWorkOrders={(newWOs) => setRawWOs(newWOs)}
            datasetMode={datasetMode}
            onSwitchDataset={(mode) => {
              setDatasetMode(mode);
              if (mode === 'enterprise') {
                setRawDeals(enterpriseDealsData);
                setRawWOs(enterpriseWorkOrdersData);
              } else {
                setRawDeals(rawDealsData);
                setRawWOs(rawWorkOrdersData);
              }
            }}
            onResetData={() => {
              if (datasetMode === 'enterprise') {
                setRawDeals(enterpriseDealsData);
                setRawWOs(enterpriseWorkOrdersData);
              } else {
                setRawDeals(rawDealsData);
                setRawWOs(rawWorkOrdersData);
              }
            }}
          />
        )}
      </main>

      {/* Modals */}
      <DecisionLogModal
        isOpen={isDecisionLogOpen}
        onClose={() => setIsDecisionLogOpen(false)}
      />

      <LeadershipUpdateModal
        isOpen={isLeadershipUpdatesOpen}
        onClose={() => setIsLeadershipUpdatesOpen(false)}
        deals={cleanedData.deals}
        workOrders={cleanedData.workOrders}
        kpis={cleanedData.kpis}
        sectorMetrics={cleanedData.sectorMetrics}
        dataHealth={cleanedData.dataHealth}
      />

      <DataHealthModal
        isOpen={isDataHealthOpen}
        onClose={() => setIsDataHealthOpen(false)}
        dataHealth={cleanedData.dataHealth}
      />

      <MondayConfigModal
        isOpen={isMondayConfigOpen}
        onClose={() => setIsMondayConfigOpen(false)}
        config={mondayConfig}
        onSaveConfig={setMondayConfig}
        onFetchLiveBoards={handleFetchLiveBoards}
        isFetchingLive={isFetchingLive}
      />

      <DeliverablesModal
        isOpen={isDeliverablesOpen}
        onClose={() => setIsDeliverablesOpen(false)}
        onSelectTab={setActiveTab}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onSelectPrompt={(prompt) => {
          setInitialPrompt(prompt);
          setActiveTab('chat');
        }}
        onOpenLeadershipUpdates={() => setIsLeadershipUpdatesOpen(true)}
        onOpenDataHealth={() => setIsDataHealthOpen(true)}
      />

      {/* Persistent Floating AI Agent Assistant (accessible on Dashboard and Data tabs) */}
      {activeTab !== 'chat' && (
        <FloatingAgentDrawer
          deals={cleanedData.deals}
          workOrders={cleanedData.workOrders}
          kpis={cleanedData.kpis}
          sectorMetrics={cleanedData.sectorMetrics}
          dataHealth={cleanedData.dataHealth}
          onNavigateToFullChat={() => setActiveTab('chat')}
        />
      )}

    </div>
  );
}
