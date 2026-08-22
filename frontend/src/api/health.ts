import { apiGet } from './client';

export interface HealthStatus {
  status: 'ok';
  uptime: number;
  timestamp: string;
}

export function fetchHealth(): Promise<HealthStatus> {
  return apiGet<HealthStatus>('/api/health');
}
