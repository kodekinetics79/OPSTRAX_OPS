export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
};

export type ModuleRecord = {
  id: number;
  name: string;
  status: string;
  owner: string;
  metric: string;
  updatedAt: string;
  priority: string;
  location: string;
  [key: string]: unknown;
};

export type ModuleConfig = {
  key: string;
  title: string;
  path: string;
  description: string;
  table: string;
  icon: string;
};
