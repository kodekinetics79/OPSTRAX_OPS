import { getData, postData, api } from './api';

export type VehicleRecord = {
  id: number;
  vehicleCode: string;
  name: string;
  plateNumber: string;
  vin: string;
  vehicleType: string;
  make: string;
  model: string;
  modelYear: number;
  fuelType: string;
  ownershipType: string;
  region: string;
  status: string;
  assignedDriverId?: number;
  assignedDriver?: string;
  deviceId: string;
  cameraId: string;
  odometer: number;
  engineHours: number;
  utilizationPercent: number;
  safetyScore: number;
  riskScore: number;
  riskLevel: string;
  maintenanceStatus: string;
  complianceStatus: string;
  deviceStatus: string;
  cameraStatus: string;
  notes?: string;
  recommendedAction: string;
  updatedAt: string;
  documents?: any[];
  timeline?: any[];
  recommendations?: any[];
  smartAssignment?: any;
};

export type MasterSummary = {
  fleetReadinessScore?: number;
  driverReadinessScore?: number;
  masterDataCompletenessScore: number;
  reports: string[];
  kpis: { key: string; label: string; value: string | number; trend: string; status: string; explanation: string; actionIntent: string; icon: string }[];
};

export type VehicleFilters = Partial<Record<'search' | 'status' | 'type' | 'region' | 'riskLevel' | 'maintenanceStatus' | 'complianceStatus' | 'assignedDriver', string>>;

const qs = (filters: Record<string, string | undefined>) => {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'All') as [string, string][]).toString();
  return query ? `?${query}` : '';
};

export const fetchVehicles = (filters: VehicleFilters = {}) => getData<VehicleRecord[]>(`/vehicles${qs(filters)}`);
export const fetchVehicle = (id: number) => getData<VehicleRecord>(`/vehicles/${id}`);
export const fetchVehicleSummary = () => getData<MasterSummary>('/vehicles/summary');
export const fetchVehicleTimeline = (id: number) => getData<any[]>(`/vehicles/${id}/timeline`);
export const fetchVehicleRecommendations = (id: number) => getData<any[]>(`/vehicles/${id}/recommendations`);
export const createVehicle = (payload: Partial<VehicleRecord>) => postData<VehicleRecord>('/vehicles', payload);
export const updateVehicle = (id: number, payload: Partial<VehicleRecord>) => api.put(`/vehicles/${id}`, payload).then((r) => r.data.data as VehicleRecord);
export const deleteVehicle = (id: number) => api.delete(`/vehicles/${id}`).then((r) => r.data.data);
export const assignDriver = (id: number, driverId: number) => postData<VehicleRecord>(`/vehicles/${id}/assign-driver`, { driverId });
export const changeVehicleStatus = (id: number, status: string) => postData<VehicleRecord>(`/vehicles/${id}/change-status`, { status });
export const previewVehicleImport = () => postData('/vehicles/import-preview', { rows: 24 });
