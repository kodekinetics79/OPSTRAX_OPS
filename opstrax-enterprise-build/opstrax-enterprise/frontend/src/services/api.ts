import axios from 'axios';
import type { ApiResponse, ModuleRecord } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8088/api';
export const EVENTS_BASE_URL = import.meta.env.VITE_EVENTS_BASE_URL ?? 'http://localhost:8090';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opstrax_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getData<T>(url: string): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url);
  return response.data.data;
}

export async function postData<T>(url: string, payload: unknown): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, payload);
  return response.data.data;
}

export const fetchModule = (key: string) => getData<ModuleRecord[]>(`/modules/${key}`);
export const createModuleRecord = (key: string, payload: Partial<ModuleRecord>) => postData<ModuleRecord>(`/modules/${key}`, payload);
