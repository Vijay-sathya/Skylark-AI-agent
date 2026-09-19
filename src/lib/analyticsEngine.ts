import { CleanDeal, CleanWorkOrder } from '../types';

export interface SectorMetric {
  sector: string;
  totalPipeline: number;
  wonBookings: number;
  weightedPipeline: number;
  dealCount: number;
  wonCount: number;
  winRate: number; // %
  activeWorkOrders: number;
  completedWorkOrders: number;
  delayedWorkOrders: number;
  avgTatDays: number;
  totalFlightHours: number;
  executedBilling: number;
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
}

export function computeExecutiveKPIs(deals: CleanDeal[], workOrders: CleanWorkOrder[]): ExecutiveKPIs {
  const wonDeals = deals.filter(d => d.isWon);
  const pipelineDeals = deals.filter(d => d.isPipeline);

  const totalPipelineValue = pipelineDeals.reduce((acc, d) => acc + d.normalizedValue, 0);
  const totalWonBookings = wonDeals.reduce((acc, d) => acc + d.normalizedValue, 0);
  const weightedPipelineValue = pipelineDeals.reduce((acc, d) => acc + d.weightedValue, 0);

  const closedDealsCount = deals.filter(d => d.isWon || d.isLost).length;
  const overallWinRate = closedDealsCount > 0 ? Math.round((wonDeals.length / closedDealsCount) * 100) : 0;

  const completedWOs = workOrders.filter(w => w.isCompleted);
  const delayedWOs = workOrders.filter(w => w.isDelayed);
  const activeWOs = workOrders.filter(w => w.isActive);

  // TAT
  const completedWithTat = completedWOs.filter(w => w.turnaroundDays !== null);
  const avgTat = completedWithTat.length > 0
    ? Math.round(completedWithTat.reduce((acc, w) => acc + (w.turnaroundDays || 0), 0) / completedWithTat.length)
    : 14;

  const onTimeCount = completedWOs.filter(w => !w.isDelayed && w.delayDays === 0).length;
  const onTimeRate = completedWOs.length > 0 ? Math.round((onTimeCount / completedWOs.length) * 100) : 80;

  const totalFlightHours = Math.round(workOrders.reduce((acc, w) => acc + w.flightHoursLogged, 0) * 10) / 10;
  const pilotsAssigned = workOrders.reduce((acc, w) => acc + (w.isActive ? w.pilotsAssigned : 0), 0);

  // At-risk revenue: active delayed work orders + high probability late-stage deals past close date
  const delayedBilling = delayedWOs.reduce((acc, w) => acc + w.billingValue, 0);
  const atRiskRevenue = delayedBilling;

  const totalExecutedBilling = completedWOs.reduce((acc, w) => acc + w.billingValue, 0);

  return {
    totalPipelineValue,
    totalWonBookings,
    weightedPipelineValue,
    overallWinRate,
    activePipelineDeals: pipelineDeals.length,
    totalWorkOrders: workOrders.length,
    completedWorkOrders: completedWOs.length,
    activeWorkOrders: activeWOs.length,
    delayedWorkOrders: delayedWOs.length,
    onTimeDeliveryRate: onTimeRate,
    avgTurnaroundDays: avgTat,
    totalFlightHoursLogged: totalFlightHours,
    pilotsDeployed: pilotsAssigned,
    atRiskRevenue,
    totalExecutedBilling
  };
}

export function computeSectorMetrics(deals: CleanDeal[], workOrders: CleanWorkOrder[]): SectorMetric[] {
  const sectors = Array.from(
    new Set([...deals.map(d => d.normalizedSector), ...workOrders.map(w => w.normalizedSector)])
  );

  return sectors.map(sector => {
    const sDeals = deals.filter(d => d.normalizedSector === sector);
    const sWOs = workOrders.filter(w => w.normalizedSector === sector);

    const totalPipeline = sDeals.filter(d => d.isPipeline).reduce((sum, d) => sum + d.normalizedValue, 0);
    const wonBookings = sDeals.filter(d => d.isWon).reduce((sum, d) => sum + d.normalizedValue, 0);
    const weightedPipeline = sDeals.filter(d => d.isPipeline).reduce((sum, d) => sum + d.weightedValue, 0);

    const wonCount = sDeals.filter(d => d.isWon).length;
    const closedCount = sDeals.filter(d => d.isWon || d.isLost).length;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

    const activeWorkOrders = sWOs.filter(w => w.isActive).length;
    const completedWorkOrders = sWOs.filter(w => w.isCompleted).length;
    const delayedWorkOrders = sWOs.filter(w => w.isDelayed).length;

    const completedTat = sWOs.filter(w => w.isCompleted && w.turnaroundDays !== null);
    const avgTatDays = completedTat.length > 0
      ? Math.round(completedTat.reduce((sum, w) => sum + (w.turnaroundDays || 0), 0) / completedTat.length)
      : 0;

    const totalFlightHours = Math.round(sWOs.reduce((sum, w) => sum + w.flightHoursLogged, 0) * 10) / 10;
    const executedBilling = sWOs.filter(w => w.isCompleted).reduce((sum, w) => sum + w.billingValue, 0);

    return {
      sector,
      totalPipeline,
      wonBookings,
      weightedPipeline,
      dealCount: sDeals.length,
      wonCount,
      winRate,
      activeWorkOrders,
      completedWorkOrders,
      delayedWorkOrders,
      avgTatDays,
      totalFlightHours,
      executedBilling
    };
  }).sort((a, b) => (b.wonBookings + b.totalPipeline) - (a.wonBookings + a.totalPipeline));
}

export function getCrossBoardCorrelation(deals: CleanDeal[], workOrders: CleanWorkOrder[]) {
  // Correlate deals won to work order fulfillment
  const wonDeals = deals.filter(d => d.isWon);
  
  return wonDeals.map(deal => {
    const matchingWOs = workOrders.filter(w => w.dealId === deal.id);
    const totalWOBilling = matchingWOs.reduce((sum, w) => sum + w.billingValue, 0);
    const hasDelays = matchingWOs.some(w => w.isDelayed);
    const isFulfilled = matchingWOs.length > 0 && matchingWOs.every(w => w.isCompleted);
    const inExecution = matchingWOs.some(w => w.isActive);

    return {
      dealId: deal.id,
      dealName: deal.name,
      clientName: deal.clientName,
      sector: deal.normalizedSector,
      dealValue: deal.normalizedValue,
      matchingWorkOrdersCount: matchingWOs.length,
      workOrders: matchingWOs.map(w => ({
        woNumber: w.woNumber,
        status: w.normalizedStatus,
        tatDays: w.turnaroundDays,
        isDelayed: w.isDelayed,
        delayReason: w.delayReason,
        billingValue: w.billingValue
      })),
      totalWOBilling,
      executionStatus: isFulfilled ? 'Fully Delivered' : inExecution ? 'In Field Execution' : matchingWOs.length === 0 ? 'Pending WO Kickoff' : 'Mixed Status',
      hasDelays,
      delayReason: matchingWOs.find(w => w.isDelayed)?.delayReason || null
    };
  });
}
