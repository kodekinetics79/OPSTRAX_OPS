import { getData, postData } from './api';

export type CommandKpi = {
  key: string;
  label: string;
  value: string | number;
  trend: string;
  status: string;
  explanation: string;
  actionIntent: string;
  icon: string;
};

export type CommandAction = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  status: string;
  linkedEntityType: string;
  linkedEntityId: number;
  ownerRole: string;
  dueAt: string;
  updatedAt?: string;
};

export type CommandEvent = {
  id: number;
  eventType: string;
  severity: string;
  title: string;
  description: string;
  linkedEntityType: string;
  linkedEntityId: number;
  occurredAt: string;
};

export type AiRecommendation = {
  id: number;
  category: string;
  severity: string;
  title: string;
  insight: string;
  evidenceJson: string;
  recommendedAction: string;
  linkedEntityType: string;
  linkedEntityId: number;
  status: string;
  createdAt: string;
};

export type FleetSnapshot = {
  vehicle: string;
  driver: string;
  status: string;
  currentJob: string;
  location: string;
  eta: string;
  riskScore: number;
  recommendedAction: string;
};

export type DispatchSnapshot = {
  status: string;
  count: number;
  risk: string;
};

export type CommandCenterSummary = {
  operationalStatus: 'Healthy' | 'Watch' | 'At Risk' | 'Critical' | string;
  generatedAt: string;
  executiveBrief: string;
  riskHeatScore: { fleet: number; vehicles: number; jobs: number; drivers: number };
  costLeakageRadar: { category: string; value: number; severity: string; explanation: string }[];
  kpis: CommandKpi[];
  aiBrief: AiRecommendation[];
  priorityActions: CommandAction[];
  timeline: CommandEvent[];
  charts: {
    weeklyCompletedJobs: { day: string; completed: number; onTime: number }[];
    onTimeDeliveryTrend: { day: string; percent: number }[];
    idleCostTrend: { day: string; cost: number }[];
    safetyScoreTrend: { day: string; score: number }[];
    maintenanceRiskByVehicleType: { name: string; value: number }[];
    jobsByStatus: { status: string; count: number }[];
  };
  fleetSnapshot: FleetSnapshot[];
  dispatchSnapshot: DispatchSnapshot[];
  mapPreview: {
    vehicles: { id: number; name: string; status: string; priority: string; location: string; x: number; y: number }[];
    geofences: { name: string; severity: string }[];
    selectedVehicle: Record<string, string | number>;
  };
  alerts: { id: number; title: string; severity: string; message: string; updatedAt: string }[];
  permissions: { visibleTo: string[]; restrictedFor: string[]; routeGuardFoundation: boolean };
};

export const fetchCommandCenterSummary = () => getData<CommandCenterSummary>('/command-center/summary');
export const acknowledgeCommandAction = (actionId: number) => postData<CommandAction>(`/command-center/actions/${actionId}/acknowledge`, {});
export const completeCommandAction = (actionId: number) => postData<CommandAction>(`/command-center/actions/${actionId}/complete`, {});
