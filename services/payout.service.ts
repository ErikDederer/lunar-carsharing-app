import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/apiError';
import type { Payout } from '@/types/payout';

export const payoutService = {
  getMine: async (): Promise<Payout[]> => {
    const res = await apiFetch('/payouts');
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<Payout[]>;
  },
};
