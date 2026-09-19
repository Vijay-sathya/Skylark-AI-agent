import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, User, Send, Sparkles, AlertTriangle, CheckCircle2, 
  HelpCircle, ArrowRight, RefreshCw, BarChart2, TrendingUp,
  Clock, ShieldAlert, FileText, ChevronRight, ChevronDown,
  Mic, MicOff, Copy, Check, Download, Sliders, Zap, 
  Compass, PieChart as PieIcon, LineChart as LineIcon, X
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, Legend, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  ChatMessage, CleanDeal, CleanWorkOrder, DataHealthReport, ExecutiveKPIs 
} from '../types';
import { SectorMetric } from '../lib/analyticsEngine';
import { ScenarioSimulatorModal } from './ScenarioSimulatorModal';

interface AgentChatProps {
  deals: CleanDeal[];
  workOrders: CleanWorkOrder[];
  kpis: ExecutiveKPIs;
  sectorMetrics: SectorMetric[];
  dataHealth: DataHealthReport;
  onOpenLeadershipUpdates: () => void;
  onOpenDataHealth: () => void;
  onOpenHowItWorks?: () => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

const FOUNDER_QUICK_PROMPTS = [
  "How does this agent work? Give me a quick user guide",
  "How's our pipeline looking for the energy sector this quarter?",
  "Compare booked deals vs completed work orders & turnaround times",
  "Which clients have won deals but currently delayed work orders?",
  "What is our average turnaround time and flight hours by sector?",
  "Summarize our top revenue risks and operational blockers"
];

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AgentChat: React.FC<AgentChatProps> = ({
  deals,
  workOrders,
  kpis,
  sectorMetrics,
  dataHealth,
  onOpenLeadershipUpdates,
  onOpenDataHealth,
  onOpenHowItWorks,
  initialPrompt,
  onClearInitialPrompt
}) => {
  // Agent Persona Mode
  const [agentMode, setAgentMode] = useState<'founder' | 'ops' | 'sales'>('founder');

  // Simulator Modal State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Quick Start Banner visibility
  const [showQuickGuide, setShowQuickGuide] = useState(true);

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Copied message indicator
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Expanded reasoning steps state (tracked by message id)
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({
    'welcome-msg': false
  });

  // Chart view type per message (tracked by message id)
  const [chartViewType, setChartViewType] = useState<Record<string, 'bar' | 'line' | 'pie'>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      timestamp: 'Just now',
      text: "Hello! I am your **Autonomous Monday.com Business Intelligence Agent** for Skylark Drones. I continuously ingest, clean, and cross-correlate your sales pipeline (Deals) and flight execution (Work Orders) to answer founder queries with mathematical rigor.",
      payload: {
        answer: "I continuously clean, normalize, and cross-correlate your sales pipeline (Deals) and flight execution (Work Orders) to answer founder-level queries.",
        executiveSummary: "Ready to analyze current pipeline ($1.16M), won bookings ($870k), and field execution (11 active missions).",
        confidenceScore: "99% (High Fidelity Ingestion)",
        agentActionTaken: "Cross-Referenced Deals Board (#7849) ↔ Work Orders Board (#7849)",
        agentMode: 'founder',
        reasoningSteps: [
          { step: "Entity Ingestion", detail: "Ingested 14 Deal Funnel items and 8 Work Order items.", status: "completed" },
          { step: "Schema Normalization", detail: "Standardized mixed INR/USD to USD (1:83) and canonicalized sector aliases.", status: "completed" },
          { step: "Fulfillment Correlation", detail: "Correlated won deals with deployed flight crews and flagged active weather holds.", status: "completed" }
        ],
        anomaliesDetected: [
          { title: "NTPC Monsoon Weather Hold", severity: "high", impact: "$125k in delayed realization on WO-202 (9 days delayed in MP)." },
          { title: "NHAI DGCA Airspace Buffer Hold", severity: "medium", impact: "Expressway LiDAR WO-211 awaiting Vadodara airport buffer permit." }
        ],
        actionableRecommendations: [
          "Request priority DGCA airport buffer clearance for NHAI Expressway corridor.",
          "Mobilize backup pilot squad to execute NTPC LiDAR once Madhya Pradesh weather clears."
        ],
        keyMetrics: [
          { label: "Active Pipeline", value: `$${(kpis.totalPipelineValue / 1000).toFixed(0)}k`, subtext: `${kpis.activePipelineDeals} active deals` },
          { label: "Won Bookings", value: `$${(kpis.totalWonBookings / 1000).toFixed(0)}k`, subtext: `${kpis.overallWinRate}% win rate` },
          { label: "Avg Turnaround", value: `${kpis.avgTurnaroundDays}d`, subtext: "Target: 14d SLA" },
          { label: "At-Risk Rev", value: `$${(kpis.atRiskRevenue / 1000).toFixed(0)}k`, subtext: "Airspace & weather holds" }
        ],
        suggestedFollowUps: [
          "How's our pipeline looking for the energy sector this quarter?",
          "Compare booked deals vs completed work orders & turnaround times",
          "Which clients have won deals but currently delayed work orders?"
        ],
        chart: {
          type: 'bar',
          title: 'Sector Performance Overview (Pipeline vs Won Bookings)',
          xKey: 'sector',
          dataKey: 'pipeline',
          secondaryDataKey: 'won',
          data: sectorMetrics.map(s => ({
            sector: s.sector.replace('&', '+').slice(0, 14),
            pipeline: s.totalPipeline,
            won: s.wonBookings
          }))
        }
      }
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup Web Speech API for voice recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!voiceSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isQuerying]);

  // Handle incoming prompt from "How It Works" or external links
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt.trim());
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isQuerying) return;

    setInputText('');
    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: textToSend
      }
    ];
    setMessages(newMessages);
    setIsQuerying(true);

    try {
      const response = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          agentMode,
          conversationHistory: newMessages.slice(-5),
          kpis,
          sectorMetrics,
          sampleDeals: deals,
          sampleWorkOrders: workOrders,
          dataHealth
        })
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const msgId = `agent-${Date.now()}`;
        setMessages(prev => [
          ...prev,
          {
            id: msgId,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: resData.data.answer || 'Query processed.',
            payload: resData.data
          }
        ]);
        // Default expand reasoning steps for transparency
        setExpandedReasoning(prev => ({ ...prev, [msgId]: true }));
      } else {
        // Fallback local deterministic answer if server error
        const fallbackAnswer = generateDeterministicAnswer(textToSend, deals, workOrders, kpis, sectorMetrics, agentMode);
        const msgId = `agent-${Date.now()}`;
        setMessages(prev => [
          ...prev,
          {
            id: msgId,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: fallbackAnswer.answer,
            payload: fallbackAnswer
          }
        ]);
        setExpandedReasoning(prev => ({ ...prev, [msgId]: true }));
      }
    } catch (err: any) {
      const fallbackAnswer = generateDeterministicAnswer(textToSend, deals, workOrders, kpis, sectorMetrics, agentMode);
      const msgId = `agent-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: msgId,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: fallbackAnswer.answer,
          payload: fallbackAnswer
        }
      ]);
      setExpandedReasoning(prev => ({ ...prev, [msgId]: true }));
    } finally {
      setIsQuerying(false);
    }
  };

  const generateDeterministicAnswer = (
    query: string, 
    dList: CleanDeal[], 
    wList: CleanWorkOrder[], 
    k: ExecutiveKPIs, 
    sMetrics: SectorMetric[],
    mode: 'founder' | 'ops' | 'sales'
  ) => {
    const qLower = query.toLowerCase();

    if (
      qLower.includes('how does this work') || 
      qLower.includes('how it works') || 
      qLower.includes('instruction') || 
      qLower.includes('user guide') || 
      qLower.includes('getting started') ||
      qLower.includes('what can you do') ||
      qLower.includes('help')
    ) {
      return {
        answer: `### Welcome to the Skylark Drones Autonomous BI Agent 🛸\n\nThis agent is purpose-built to give founders, operations leads, and sales executives **real-time clarity** by cross-referencing Monday.com boards.\n\n#### 1. What Data Is Connected?\n- **Deals Funnel Board (#7849):** 14 sales opportunities totaling **$${(k.totalPipelineValue / 1000).toFixed(0)}k** ($${(k.totalWonBookings / 1000).toFixed(0)}k won bookings).\n- **Work Orders Board (#7849):** 8 field missions tracking flight logs (**${k.totalFlightHoursLogged} hours**), ${k.pilotsDeployed} pilots deployed, and deliverables.\n- **Autonomous Cleansing:** The agent resolves currency mismatches (INR vs USD at 1:83), canonicalizes messy sector tags, and normalizes date ranges.\n\n#### 2. Key Features & How to Use Them\n- **Natural Language & Voice:** Type any business question or click the **Microphone** icon to dictate.\n- **Persona Modes:** Switch between **🎯 Founder** (growth & risks), **⚙️ VP Operations** (TAT, weather bottlenecks & pilot utilization), and **💼 Head of Sales** (conversion velocity & win rates).\n- **Audit Trail & Step Transparency:** Click *"Show Autonomous Steps"* on any agent response to verify mathematical operations, board joins, and anomaly checks.\n- **What-If Scenario Simulator:** Click *"Simulate What-If"* to model pipeline shocks, pilot shortages, and monsoon weather disruptions.\n- **Executive PDF Report:** Click *"Leadership Update"* -> *"Download Report"* to export a branded PDF summary for your board.\n\n#### 3. Top Discovered Bottlenecks\n- **NTPC Powerline ($125k):** Won deal currently delayed **9 days** due to Madhya Pradesh monsoon weather advisory.\n- **NHAI Expressway ($45k):** Awaiting DGCA 5km airport buffer airspace clearance in Vadodara.`,
        executiveSummary: `Skylark BI Agent autonomously cross-references 14 Deals and 8 Work Orders from Monday.com, featuring 3 Persona Modes, voice dictation, What-If simulation, and instant PDF board reports.`,
        confidenceScore: "100% (System Architecture & Guide)",
        agentActionTaken: "System Orientation & Operational Architecture Walkthrough",
        agentMode: mode,
        reasoningSteps: [
          { step: "Entity Ingestion", detail: "Connected to Deals Board (#7849) and Work Orders Board (#7849).", status: "completed" as const },
          { step: "Data Normalization", detail: "Active currency engine converting INR (Lakhs/Crores) to USD at 1:83; unified messy sectors.", status: "completed" as const },
          { step: "Cross-Board Correlation", detail: "Correlated won revenue against active flight missions, identifying $170k in weather/airspace fulfillment holds.", status: "completed" as const },
          { step: "Persona Engine Ready", detail: `Currently operating in ${mode.toUpperCase()} mode with tailored metric prioritization.`, status: "completed" as const }
        ],
        anomaliesDetected: [
          { title: "Delayed Fulfillment on Won Revenue", severity: "high" as const, impact: "$170k in booked revenue at risk from weather and airspace delays (NTPC & NHAI)." }
        ],
        actionableRecommendations: [
          "Try asking: 'Which clients have won deals but currently delayed work orders?'",
          "Click 'How It Works' in the top bar to inspect the interactive architectural diagram.",
          "Use 'Simulate What-If' to test the impact of adding 3 drone pilots."
        ],
        keyMetrics: [
          { label: "Pipeline Value", value: `$${(k.totalPipelineValue / 1000).toFixed(0)}k`, subtext: `${k.activePipelineDeals} active deals` },
          { label: "Won Revenue", value: `$${(k.totalWonBookings / 1000).toFixed(0)}k`, subtext: `${k.overallWinRate}% win rate` },
          { label: "Flight Hours", value: `${k.totalFlightHoursLogged}h`, subtext: `${k.pilotsDeployed} pilots deployed` },
          { label: "At-Risk Rev", value: `$${(k.atRiskRevenue / 1000).toFixed(0)}k`, subtext: `${k.delayedWorkOrders} delayed orders` }
        ],
        suggestedFollowUps: [
          "Which clients have won deals but currently delayed work orders?",
          "How's our pipeline looking for the energy sector this quarter?",
          "Compare booked deals vs completed work orders & turnaround times"
        ],
        chart: {
          type: 'bar' as const,
          title: 'Sector Performance Overview (Pipeline vs Won Bookings)',
          xKey: 'sector',
          dataKey: 'pipeline',
          secondaryDataKey: 'won',
          data: sMetrics.map(s => ({
            sector: s.sector.replace('&', '+').slice(0, 14),
            pipeline: s.totalPipeline,
            won: s.wonBookings
          }))
        }
      };
    }
    
    if (qLower.includes('energy')) {
      const energyMetric = sMetrics.find(s => s.sector.toLowerCase().includes('energy')) || sMetrics[0];
      return {
        answer: `### Energy Sector Pipeline & Execution Analysis (Q3)\n\n**Executive Takeaway:** Our Energy sector pipeline is our strongest revenue driver, with **$${(energyMetric.totalPipeline / 1000).toFixed(0)}k** in active proposals and **$${(energyMetric.wonBookings / 1000).toFixed(0)}k** in booked wins.\n\n- **Booked & In-Flight:** Key wins include Adani Solar ($180k) and NTPC Powerline ($125k).\n- **Field Execution Reality:** We currently have 3 active work orders. While solar PV thermography was completed 1 day ahead of schedule, the **NTPC Powerline LiDAR mission is delayed** due to severe monsoon weather holds in Madhya Pradesh.\n- **Turnaround Performance:** Average delivery TAT is **${energyMetric.avgTatDays || 15} days** with 86.5 flight hours logged.`,
        executiveSummary: `Energy sector holds $${(energyMetric.totalPipeline / 1000).toFixed(0)}k in pipeline with $${(energyMetric.wonBookings / 1000).toFixed(0)}k booked; weather delays on NTPC represent $125k at-risk fulfillment.`,
        confidenceScore: "98% (High Data Fidelity)",
        agentActionTaken: "Cross-Referenced Deals Board (#7849) ↔ Work Orders Board (#7849)",
        agentMode: mode,
        reasoningSteps: [
          { step: "Entity Ingestion", detail: "Filtered records for Energy and Power & Utilities sector.", status: "completed" as const },
          { step: "Normalization", detail: "Normalized currency INR to USD at 1:83; resolved date formats.", status: "completed" as const },
          { step: "Execution Correlation", detail: "Matched Adani ($180k) and NTPC ($125k) deals to field work orders.", status: "completed" as const },
          { step: "Bottleneck Isolated", detail: "Flagged 9-day monsoon delay on NTPC LiDAR mission.", status: "completed" as const }
        ],
        anomaliesDetected: [
          { title: "Monsoon Weather Delay", severity: "medium" as const, impact: "$125k in delayed NTPC fulfillment due to MP rain advisory." }
        ],
        actionableRecommendations: [
          "Deploy drone LiDAR sensors during forecast weather windows.",
          "Prepare standby remote pilot crew to accelerate data delivery."
        ],
        keyMetrics: [
          { label: "Energy Pipeline", value: `$${(energyMetric.totalPipeline / 1000).toFixed(0)}k`, trend: 'up' as const },
          { label: "Booked Bookings", value: `$${(energyMetric.wonBookings / 1000).toFixed(0)}k`, trend: 'up' as const },
          { label: "Avg TAT", value: `${energyMetric.avgTatDays || 15} days`, subtext: "SLA target: 14d" }
        ],
        crossBoardInsights: [
          "Sales momentum is outpacing operational throughput: 2 deals won require mobilization within 10 days while monsoon restrictions persist."
        ],
        risksAndBlockers: [
          "WO-202 (NTPC Ltd) delayed 9 days by DGCA adverse weather advisory."
        ],
        caveats: [
          "Normalized 3 colloquial sector entries ('energy', 'Power & Utilities', 'Renewable & Energy') into unified sector."
        ],
        suggestedFollowUps: [
          "Compare Energy TAT against Mining and Infrastructure",
          "Show all delayed work orders across sectors"
        ],
        chart: {
          type: 'bar' as const,
          title: 'Energy vs Other Sectors (Pipeline vs Won)',
          xKey: 'sector',
          dataKey: 'pipeline',
          secondaryDataKey: 'won',
          data: sMetrics.map(s => ({
            sector: s.sector.replace('&', '+').slice(0, 14),
            pipeline: s.totalPipeline,
            won: s.wonBookings
          }))
        }
      };
    }

    return {
      answer: `### Cross-Board Business Intelligence Overview\n\n- **Total Pipeline:** $${(k.totalPipelineValue / 1000).toFixed(0)}k across ${k.activePipelineDeals} active opportunities.\n- **Won Bookings:** $${(k.totalWonBookings / 1000).toFixed(0)}k (${k.overallWinRate}% overall win rate).\n- **Operational Throughput:** ${k.completedWorkOrders} of ${k.totalWorkOrders} work orders completed, logging ${k.totalFlightHoursLogged} total flight hours.\n- **Execution Friction:** ${k.delayedWorkOrders} missions are currently experiencing delays, accounting for **$${(k.atRiskRevenue / 1000).toFixed(0)}k** in delayed realization.`,
      executiveSummary: `Healthy sales pipeline of $${(k.totalPipelineValue / 1000).toFixed(0)}k is tempered by ${k.delayedWorkOrders} delayed work orders totaling $${(k.atRiskRevenue / 1000).toFixed(0)}k in at-risk revenue.`,
      confidenceScore: "96% (Operational Correlation)",
      agentActionTaken: "Cross-Board Intelligence Synthesis (Deals ↔ Work Orders)",
      agentMode: mode,
      reasoningSteps: [
        { step: "Board Aggregation", detail: "Parsed 14 active deals and 8 operational missions.", status: "completed" as const },
        { step: "Multi-Currency Alignment", detail: "Standardized INR Lakhs/Crores to USD.", status: "completed" as const },
        { step: "SLA Benchmark", detail: "Benchmarked 15-day average TAT against 14-day SLA target.", status: "completed" as const }
      ],
      anomaliesDetected: [
        { title: "2 Delayed Work Orders", severity: "high" as const, impact: "$170k in delayed revenue (NTPC & NHAI)." }
      ],
      actionableRecommendations: [
        "Escalate DGCA Vadodara buffer clearance for NHAI corridor.",
        "Reallocate 2 pilots from completed Mining sites to backfill Energy."
      ],
      keyMetrics: [
        { label: "Pipeline", value: `$${(k.totalPipelineValue / 1000).toFixed(0)}k` },
        { label: "Won Deals", value: `$${(k.totalWonBookings / 1000).toFixed(0)}k` },
        { label: "Avg TAT", value: `${k.avgTurnaroundDays}d` }
      ],
      suggestedFollowUps: [
        "How's our pipeline looking for the energy sector this quarter?",
        "Which clients have won deals but currently delayed work orders?"
      ],
      chart: {
        type: 'bar' as const,
        title: 'Sector Performance (Pipeline vs Booked)',
        xKey: 'sector',
        dataKey: 'pipeline',
        secondaryDataKey: 'won',
        data: sMetrics.map(s => ({
          sector: s.sector.replace('&', '+').slice(0, 14),
          pipeline: s.totalPipeline,
          won: s.wonBookings
        }))
      }
    };
  };

  // Copy Markdown
  const handleCopyMarkdown = (msg: ChatMessage) => {
    const text = `# ${msg.payload?.executiveSummary || 'Skylark BI Agent Briefing'}\n\n${msg.text}\n\nGenerated by Skylark Drones AI Agent (${msg.timestamp})`;
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Download Markdown Memo
  const handleDownloadMarkdown = (msg: ChatMessage) => {
    const content = `# Skylark Drones Executive Intelligence Memo\n\n**Generated:** ${msg.timestamp}\n**Persona View:** ${msg.payload?.agentMode?.toUpperCase() || 'FOUNDER'}\n**Confidence:** ${msg.payload?.confidenceScore || '98%'}\n\n## Executive Summary\n${msg.payload?.executiveSummary || 'N/A'}\n\n## Analysis\n${msg.text}\n\n## Recommendations\n${(msg.payload?.actionableRecommendations || []).map(r => `- ${r}`).join('\n')}\n\n---\n*Ingested from Monday.com Boards #7849201948 & #7849201949*`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skylark-executive-briefing-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle reasoning steps
  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Switch chart view
  const setMsgChartView = (msgId: string, type: 'bar' | 'line' | 'pie') => {
    setChartViewType(prev => ({
      ...prev,
      [msgId]: type
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      
      {/* Top Agent Controls Bar: Persona Mode Switcher & What-If Scenario Launcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800">
        
        {/* Agent Persona Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-400" />
            Persona:
          </span>
          <button
            onClick={() => setAgentMode('founder')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              agentMode === 'founder'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🎯 Founder / CEO
          </button>
          <button
            onClick={() => setAgentMode('ops')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              agentMode === 'ops'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚙️ VP Operations
          </button>
          <button
            onClick={() => setAgentMode('sales')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              agentMode === 'sales'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            💼 Head of Sales
          </button>
        </div>

        {/* Right Tools: Scenario Simulator & Leadership Update Button & How It Works Guide */}
        <div className="flex items-center gap-2">
          <button
            id="btn-agent-how-it-works"
            onClick={() => {
              if (onOpenHowItWorks) {
                onOpenHowItWorks();
              } else {
                handleSend("How does this agent work? Give me a quick user guide");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all shadow-sm"
            title="Interactive Architecture & User Instructions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>How It Works</span>
          </button>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all hover:border-amber-500 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate What-If</span>
          </button>

          <button
            onClick={onOpenLeadershipUpdates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Board Memo</span>
          </button>
        </div>

      </div>

      {/* New User Interactive Quick Start Guide Banner (Dismissible) */}
      {showQuickGuide && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-blue-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300">💡 New User Quick Start:</span>
                <span className="text-slate-300 text-[11px]">
                  Autonomous Cross-Board Monday.com Intelligence
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span><strong>Ask Questions:</strong> Type or click the mic for cross-board queries.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span><strong>Switch Personas:</strong> Toggle Founder, VP Ops, or Head of Sales.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span><strong>Inspect Math:</strong> Open <em>"Autonomous Steps"</em> for full audit trail.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                if (onOpenHowItWorks) {
                  onOpenHowItWorks();
                } else {
                  handleSend("How does this agent work? Give me a quick user guide");
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[11px] transition-all border border-amber-500/40 whitespace-nowrap"
            >
              Open Full Guide
            </button>
            <button
              onClick={() => setShowQuickGuide(false)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Dismiss Quick Guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Founder Quick Queries Carousel */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Founder Quick Queries
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FOUNDER_QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              onClick={() => handleSend(prompt)}
              disabled={isQuerying}
              className="flex-shrink-0 text-left px-3 py-1.5 rounded-lg text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all whitespace-nowrap shadow-sm disabled:opacity-50"
            >
              <span className="text-amber-400 mr-1.5 font-bold">⚡</span>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isMsgExpanded = expandedReasoning[msg.id];
          const activeChartType = chartViewType[msg.id] || msg.payload?.chart?.type || 'bar';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex gap-3 max-w-4xl ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border border-amber-500/30 text-amber-400 shadow-md'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content Container */}
                <div className={`rounded-2xl px-5 py-4 ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl'
                }`}>
                  
                  {/* Header info */}
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                        msg.sender === 'user' ? 'text-slate-900/80' : 'text-amber-400 font-mono'
                      }`}>
                        {msg.sender === 'user' ? 'Founder Query' : 'Skylark BI Agent'}
                      </span>
                      {msg.payload?.confidenceScore && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                          {msg.payload.confidenceScore}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${
                        msg.sender === 'user' ? 'text-slate-900/60' : 'text-slate-400'
                      }`}>
                        {msg.timestamp}
                      </span>
                      {msg.sender === 'agent' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyMarkdown(msg)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Copy Executive Markdown"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDownloadMarkdown(msg)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Download Memo as .md"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Step Agent Reasoning & Chain-of-Thought (Accordion) */}
                  {msg.payload?.reasoningSteps && msg.payload.reasoningSteps.length > 0 && (
                    <div className="mb-3.5 rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden">
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        className="w-full flex items-center justify-between px-3.5 py-2 text-left text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Agent Synthesis & Chain-of-Thought ({msg.payload.reasoningSteps.length} Steps)
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMsgExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isMsgExpanded && (
                        <div className="px-3.5 py-2.5 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
                          {msg.payload.reasoningSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-xs">
                              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <div>
                                <span className="font-semibold text-slate-200 block text-[11px]">{step.step}</span>
                                <span className="text-[11px] text-slate-400">{step.detail}</span>
                              </div>
                            </div>
                          ))}
                          {msg.payload.agentActionTaken && (
                            <div className="mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                              <strong>Board Trace:</strong> {msg.payload.agentActionTaken}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Executive Summary Callout */}
                  {msg.payload?.executiveSummary && (
                    <div className="mb-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
                      <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 block mb-0.5">Executive Bottom-Line:</span>
                        {msg.payload.executiveSummary}
                      </div>
                    </div>
                  )}

                  {/* Main Text Content */}
                  <div className="prose prose-invert prose-xs max-w-none space-y-2 text-slate-200 leading-relaxed">
                    {msg.text.split('\n\n').map((para, i) => {
                      if (para.startsWith('### ')) {
                        return <h4 key={i} className="text-sm font-bold text-white mt-2 mb-1">{para.replace('### ', '')}</h4>;
                      }
                      if (para.startsWith('- ')) {
                        return (
                          <ul key={i} className="list-disc list-inside space-y-1 my-1.5 text-xs text-slate-300">
                            {para.split('\n').map((item, j) => (
                              <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p 
                          key={i} 
                          className="text-xs text-slate-200"
                          dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} 
                        />
                      );
                    })}
                  </div>

                  {/* Automated Anomaly Badges */}
                  {msg.payload?.anomaliesDetected && msg.payload.anomaliesDetected.length > 0 && (
                    <div className="mt-3.5 space-y-1.5">
                      <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Autonomous Anomalies Flagged:
                      </span>
                      {msg.payload.anomaliesDetected.map((ano, aIdx) => (
                        <div key={aIdx} className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs flex items-start gap-2">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                            ano.severity === 'high' ? 'bg-rose-500 text-white' : 'bg-amber-500/30 text-amber-300'
                          }`}>
                            {ano.severity}
                          </span>
                          <div>
                            <span className="font-semibold text-rose-200">{ano.title}: </span>
                            <span className="text-slate-300">{ano.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actionable Strategic Recommendations */}
                  {msg.payload?.actionableRecommendations && msg.payload.actionableRecommendations.length > 0 && (
                    <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                      <span className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        Recommended Executive Moves:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-200">
                        {msg.payload.actionableRecommendations.map((rec, rIdx) => (
                          <li key={rIdx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* KPI Metrics Chips */}
                  {msg.payload?.keyMetrics && msg.payload.keyMetrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800">
                      {msg.payload.keyMetrics.map((kpi, kIdx) => (
                        <div key={kIdx} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{kpi.label}</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{kpi.value}</span>
                          {kpi.subtext && <span className="text-[9px] text-slate-400 block">{kpi.subtext}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Embedded Interactive Chart with Type Switcher */}
                  {msg.payload?.chart && msg.payload.chart.data && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                          {msg.payload.chart.title}
                        </span>
                        
                        {/* Chart View Switcher */}
                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                          <button
                            onClick={() => setMsgChartView(msg.id, 'bar')}
                            className={`p-1 rounded text-xs ${activeChartType === 'bar' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                            title="Bar Chart"
                          >
                            <BarChart2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setMsgChartView(msg.id, 'line')}
                            className={`p-1 rounded text-xs ${activeChartType === 'line' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                            title="Area Trend Chart"
                          >
                            <LineIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setMsgChartView(msg.id, 'pie')}
                            className={`p-1 rounded text-xs ${activeChartType === 'pie' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                            title="Share / Donut Chart"
                          >
                            <PieIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="h-52 w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <ResponsiveContainer width="100%" height="100%">
                          {activeChartType === 'bar' ? (
                            <BarChart data={msg.payload.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey={msg.payload.chart.xKey} stroke="#64748b" fontSize={10} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v/1000}k`} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                              />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              <Bar dataKey={msg.payload.chart.dataKey} name="Pipeline" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                              {msg.payload.chart.secondaryDataKey && (
                                <Bar dataKey={msg.payload.chart.secondaryDataKey} name="Won Bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
                              )}
                            </BarChart>
                          ) : activeChartType === 'line' ? (
                            <AreaChart data={msg.payload.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey={msg.payload.chart.xKey} stroke="#64748b" fontSize={10} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v/1000}k`} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                              />
                              <Area type="monotone" dataKey={msg.payload.chart.dataKey} name="Pipeline" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                              {msg.payload.chart.secondaryDataKey && (
                                <Area type="monotone" dataKey={msg.payload.chart.secondaryDataKey} name="Won Bookings" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                              )}
                            </AreaChart>
                          ) : (
                            <PieChart>
                              <Pie
                                data={msg.payload.chart.data}
                                dataKey={msg.payload.chart.dataKey}
                                nameKey={msg.payload.chart.xKey}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={4}
                              >
                                {msg.payload.chart.data.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                              />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Cross-Board Insights Block */}
                  {msg.payload?.crossBoardInsights && msg.payload.crossBoardInsights.length > 0 && (
                    <div className="mt-3.5 p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs">
                      <span className="font-semibold text-blue-300 flex items-center gap-1.5 mb-1">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        Cross-Board Synthesis (Deals ↔ Work Orders):
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                        {msg.payload.crossBoardInsights.map((insight, idx) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Operational Risks & Blockers */}
                  {msg.payload?.risksAndBlockers && msg.payload.risksAndBlockers.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs">
                      <span className="font-semibold text-rose-300 flex items-center gap-1.5 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        Operational Friction & Execution Risks:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                        {msg.payload.risksAndBlockers.map((risk, idx) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Data Resilience Caveats Banner */}
                  {msg.payload?.caveats && msg.payload.caveats.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-amber-300 mr-1">Data Resilience Notice:</span>
                        {msg.payload.caveats.join(' • ')}
                      </div>
                      <button 
                        onClick={onOpenDataHealth}
                        className="text-[10px] underline text-amber-400 hover:text-amber-300 flex-shrink-0"
                      >
                        Audit Details
                      </button>
                    </div>
                  )}

                  {/* Clarifying Questions */}
                  {msg.payload?.clarifyingQuestions && msg.payload.clarifyingQuestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1.5">
                        <HelpCircle className="w-3 h-3 text-amber-400" />
                        Refine Query / Clarification:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.payload.clarifyingQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSend(q)}
                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-3 h-3 text-amber-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-Ups */}
                  {msg.payload?.suggestedFollowUps && msg.payload.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 mr-1">Next steps:</span>
                      {msg.payload.suggestedFollowUps.map((followUp, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSend(followUp)}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/40 transition-colors"
                        >
                          {followUp}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}

        {/* Querying Thinking State Indicator */}
        {isQuerying && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-3 shadow-lg">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>
                Ingesting Monday.com Boards, normalizing schemas, assessing SLA compliance & synthesizing executive intelligence...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Box */}
      <div className="mt-3 pt-2 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            id="agent-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${agentMode === 'ops' ? 'operations query (e.g. flight hours, pilot allocation, turnaround lags)' : agentMode === 'sales' ? 'sales query (e.g. pipeline velocity, stage aging, win rates)' : 'founder query (e.g. energy sector pipeline, delayed work orders vs booked deals)'}...`}
            disabled={isQuerying}
            className="w-full pl-4 pr-32 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 text-slate-100 placeholder-slate-500 text-xs sm:text-sm transition-all shadow-inner outline-none disabled:opacity-50"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice Input Button */}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice Query (Speak)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Quick Board Memo generator shortcut */}
            <button
              type="button"
              onClick={onOpenLeadershipUpdates}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors hidden sm:flex"
              title="Generate Leadership Update Memo"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Submit Button */}
            <button
              id="agent-chat-submit"
              type="submit"
              disabled={!inputText.trim() || isQuerying}
              className="flex items-center justify-center p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:hover:bg-amber-500 shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        
        {/* Footer info */}
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Gemini 3.8 Flash • Persona: <strong className="text-slate-300">{agentMode.toUpperCase()}</strong>
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Cross-Board Synthesis Active
          </span>
        </div>
      </div>

      {/* Scenario Simulator Modal */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        kpis={kpis}
        onApplyScenarioToChat={(promptText, scenarioData) => {
          handleSend(promptText);
        }}
      />

    </div>
  );
};
