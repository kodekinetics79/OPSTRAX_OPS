import { useQuery } from '@tanstack/react-query';
import { fetchVehicle, fetchVehicleSummary, fetchVehicles, type VehicleFilters } from '../services/vehiclesApi';

export const useVehicles = (filters: VehicleFilters) => useQuery({ queryKey: ['vehicles-master', filters], queryFn: () => fetchVehicles(filters) });
export const useVehicleDetail = (id?: number) => useQuery({ queryKey: ['vehicle-detail', id], queryFn: () => fetchVehicle(id!), enabled: Boolean(id) });
export const useVehicleSummary = () => useQuery({ queryKey: ['vehicle-summary'], queryFn: fetchVehicleSummary });
