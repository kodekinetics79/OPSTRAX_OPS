import { useQuery } from '@tanstack/react-query';
import { fetchDriver, fetchDriverSummary, fetchDrivers, type DriverFilters } from '../services/driversApi';

export const useDrivers = (filters: DriverFilters) => useQuery({ queryKey: ['drivers-master', filters], queryFn: () => fetchDrivers(filters) });
export const useDriverDetail = (id?: number) => useQuery({ queryKey: ['driver-detail', id], queryFn: () => fetchDriver(id!), enabled: Boolean(id) });
export const useDriverSummary = () => useQuery({ queryKey: ['driver-summary'], queryFn: fetchDriverSummary });
