import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/apiError';
import type { ConnectStatus } from '@/types/connect';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) throw await parseApiError(res);
  return res.json() as Promise<T>;
}

export const connectService = {
  getStatus: (): Promise<ConnectStatus> => request<ConnectStatus>('/connect/status'),

  createOnboardingLink: (): Promise<{ url: string }> =>
    request<{ url: string }>('/connect/onboarding-link', { method: 'POST' }),
};
