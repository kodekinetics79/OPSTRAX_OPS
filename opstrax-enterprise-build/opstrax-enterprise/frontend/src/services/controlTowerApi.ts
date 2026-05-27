import { getData, postData } from './api';

export type ControlTowerKpi = {
  key: string;
  label: string;
  value: string | number;
  trend: string;
  status: string;
  explanation: string;
  actionIntent: string;
  icon: string;
};

export type ControlTowerEntity = {
  type: 'vehicle' | 'job' | 'asset' | string;
  id: number;
  name: string;
  operator: string;
  status: string;
  zone: string;
  eta: string;
  etaRisk: string;
  riskScore: number;
  riskBand: string;
  safetyScore: number;
  currentJob: string;
  route: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  fuelIdling: string;
  maintenanceStatus: string;
  lastEvent: string;
  recommendedAction: string;
  priority: string;
};

export type ControlTowerEvent = {
  id: number | string;
  eventType?: string;
  type?: string;
  severity: string;
  title?: string;
  description?: string;
  message?: string;
  entityType?: string;
  entityId?: number | string;
  vehicleId?: number | string;
  driverId?: number | string;
  jobId?: number | string;
  lat?: number;
  lng?: number;
  occurredAt?: string;
  timestamp?: string;
};

export type ControlTowerRecommendation = {
  severity: string;
  title: string;
  evidence: string;
  recommendedAction: string;
  action: 'send-eta-update' | 'create-dispatch-review' | 'create-maintenance-review' | string;
};

export type ControlTowerSummary = {
  generatedAt: string;
  snapshot: string;
  kpis: ControlTowerKpi[];
  mapEntities: ControlTowerEntity[];
  routes: { id: number; routeId: number; name: string; pathJson: string; status: string }[];
  geofences: { id: number; name: string; type: string; centerLatitude: number; centerLongitude: number; radiusMeters: number; status: string }[];
  delayZones: { id: number; name: string; type: string; status: string }[];
  incidents: ControlTowerEvent[];
  selectedEntityDefaults?: ControlTowerEntity;
  liveEvents: ControlTowerEvent[];
  aiRecommendations: ControlTowerRecommendation[];
  filters: string[];
  permissions: { visibleTo: string[]; restrictedFor: string[]; routeGuardFoundation: boolean };
};

export type ControlTowerActionPayload = {
  entityType?: string;
  entityId?: number;
  jobId?: number;
  customerId?: number;
  message?: string;
  description?: string;
};

export const fetchControlTowerSummary = () => getData<ControlTowerSummary>('/control-tower/summary');
export const fetchControlTowerEntities = (params: Record<string, string>) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value && value !== 'All')).toString();
  return getData<ControlTowerEntity[]>(`/control-tower/entities${query ? `?${query}` : ''}`);
};
export const fetchControlTowerEntity = (type: string, id: number) => getData<ControlTowerEntity>(`/control-tower/entities/${type}/${id}`);
export const fetchControlTowerEvents = () => getData<ControlTowerEvent[]>('/control-tower/events');
export const sendEtaUpdate = (payload: ControlTowerActionPayload) => postData('/control-tower/actions/send-eta-update', payload);
export const createDispatchReview = (payload: ControlTowerActionPayload) => postData('/control-tower/actions/create-dispatch-review', payload);
export const createMaintenanceReview = (payload: ControlTowerActionPayload) => postData('/control-tower/actions/create-maintenance-review', payload);
