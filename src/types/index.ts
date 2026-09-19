export interface RawDeal {
  id: string;
  name: string;
  clientName: string;
  sector: string;
  dealValue: string | number;
  stage: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  probability?: string | number;
  owner?: string;
  region?: string;
  notes?: string;
}

export interface CleanDeal {
  id: string;
  name: string;
  clientName: string;
  originalSector: string;
  normalizedSector: string;
  originalValue: string | number;
  normalizedValue: number; // in USD or standard unit
  formattedValue: string;
  originalStage: string;
  normalizedStage: 'Discovery' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  quarter: string | null; // e.g. '2024-Q3'
  year: number | null;
  probability: number;
  weightedValue: number;
  owner: string;
  region: string;
  isWon: boolean;
  isLost: boolean;
  isPipeline: boolean;
  caveats: string[];
}

export interface RawWorkOrder {
  id: string;
  woNumber: string;
  dealId?: string;
  clientName: string;
  sector: string;
  serviceType: string;
  status: string;
  startDate?: string;
  targetDeliveryDate?: string;
  actualDeliveryDate?: string;
  pilotsAssigned?: number | string;
  flightHoursLogged?: number | string;
  billingValue?: number | string;
  delayReason?: string;
  dronesDeployed?: string;
  location?: string;
  notes?: string;
}

export interface CleanWorkOrder {
  id: string;
  woNumber: string;
  dealId: string | null;
  clientName: string;
  originalSector: string;
  normalizedSector: string;
  serviceType: string;
  originalStatus: string;
  normalizedStatus: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  startDate: string | null;
  targetDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  quarter: string | null;
  pilotsAssigned: number;
  flightHoursLogged: number;
  billingValue: number;
  formattedBilling: string;
  turnaroundDays: number | null; // from start to actual completion
  isDelayed: boolean;
  delayDays: number;
  delayReason: string | null;
  dronesDeployed: string;
  location: string;
  isCompleted: boolean;
  isActive: boolean;
  caveats: string[];
}

export interface DataHealthReport {
  totalDeals: number;
  totalWorkOrders: number;
  cleanDealsCount: number;
  dealsWithCaveats: number;
  cleanWOsCount: number;
  wosWithCaveats: number;
  completenessScore: number; // 0 - 100
  sectorNormalizationCount: number;
  dateNormalizationCount: number;
  currencyNormalizationCount: number;
  missingValuesHandledCount: number;
  caveatsList: {
    type: 'warning' | 'info' | 'error';
    category: 'Dates' | 'Currency' | 'Sectors' | 'Cross-Board' | 'Missing Data';
    message: string;
    affectedRecordCount: number;
  }[];
}

export interface ChartDataPoint {
  label?: string;
  value?: number;
  secondaryValue?: number;
  category?: string;
  [key: string]: any;
}

export interface ExecutiveKPIs {
  totalPipelineValue: number;
  totalWonBookings: number;
  weightedPipelineValue: number;
  overallWinRate: number;
  activePipelineDeals: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  activeWorkOrders: number;
  delayedWorkOrders: number;
  onTimeDeliveryRate: number;
  avgTurnaroundDays: number;
  totalFlightHoursLogged: number;
  pilotsDeployed: number;
  atRiskRevenue: number;
  totalExecutedBilling: number;
  wonDealsCount?: number;
  totalDeals?: number;
}

export interface AgentResponsePayload {
  answer: string;
  executiveSummary?: string;
  confidenceScore?: string;
  agentActionTaken?: string;
  agentMode?: 'founder' | 'ops' | 'sales';
  reasoningSteps?: {
    step: string;
    detail: string;
    status?: 'completed' | 'active';
  }[];
  anomaliesDetected?: {
    title: string;
    severity: 'low' | 'medium' | 'high';
    impact: string;
  }[];
  actionableRecommendations?: string[];
  keyMetrics?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    subtext?: string;
  }[];
  chart?: {
    type: 'bar' | 'pie' | 'line' | 'comparison';
    title: string;
    data: ChartDataPoint[];
    dataKey: string;
    secondaryDataKey?: string;
    xKey: string;
  };
  crossBoardInsights?: string[];
  risksAndBlockers?: string[];
  caveats?: string[];
  clarifyingQuestions?: string[];
  suggestedFollowUps?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text: string;
  payload?: AgentResponsePayload;
  isLoading?: boolean;
}

export interface MondayConnectionConfig {
  apiToken: string;
  dealBoardId: string;
  workOrderBoardId: string;
  useLiveApi: boolean;
  status: 'disconnected' | 'connected' | 'error';
  lastSyncedAt?: string;
  errorMessage?: string;
}
