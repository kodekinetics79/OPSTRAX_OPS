import { getData, postData, api } from './api';
import type { MasterSummary } from './vehiclesApi';

export type DriverRecord = {
  id: number;
  driverCode: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  medicalCardExpiry: string;
  region: string;
  status: string;
  availability: string;
  assignedVehicleId?: number;
  assignedVehicle?: string;
  driverType: string;
  safetyScore: number;
  utilizationPercent: number;
  hosStatus: string;
  coachingStatus: string;
  complianceStatus: string;
  riskScore: number;
  riskLevel: string;
  notes?: string;
  recommendedAction: string;
  updatedAt: string;
  documents?: any[];
  certifications?: any[];
  timeline?: any[];
  recommendations?: any[];
  smartAssignment?: any;
};

export type DriverFilters = Partial<Record<'search' | 'status' | 'region' | 'riskLevel' | 'availability' | 'assignedVehicle', string>>;

const qs = (filters: Record<string, string | undefined>) => {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'All') as [string, string][]).toString();
  return query ? `?${query}` : '';
};

export const fetchDrivers = (filters: DriverFilters = {}) => getData<DriverRecord[]>(`/drivers${qs(filters)}`);
export const fetchDriver = (id: number) => getData<DriverRecord>(`/drivers/${id}`);
export const fetchDriverSummary = () => getData<MasterSummary>('/drivers/summary');
export const fetchDriverTimeline = (id: number) => getData<any[]>(`/drivers/${id}/timeline`);
export const fetchDriverRecommendations = (id: number) => getData<any[]>(`/drivers/${id}/recommendations`);
export const createDriver = (payload: Partial<DriverRecord>) => postData<DriverRecord>('/drivers', payload);
export const updateDriver = (id: number, payload: Partial<DriverRecord>) => api.put(`/drivers/${id}`, payload).then((r) => r.data.data as DriverRecord);
export const deleteDriver = (id: number) => api.delete(`/drivers/${id}`).then((r) => r.data.data);
export const assignVehicle = (id: number, vehicleId: number) => postData<DriverRecord>(`/drivers/${id}/assign-vehicle`, { vehicleId });
export const changeDriverStatus = (id: number, status: string) => postData<DriverRecord>(`/drivers/${id}/change-status`, { status });
export const previewDriverImport = () => postData('/drivers/import-preview', { rows: 24 });
