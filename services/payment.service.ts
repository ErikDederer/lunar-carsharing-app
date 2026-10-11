import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/apiError';
import type { CheckoutResponse, DepositView } from '@/types/payment';

export const paymentService = {
  // Idempotent on the backend: calling this again for the same booking
  // (page refresh, retry after a declined card) resumes the existing
  // PaymentIntent instead of creating a new one.
  checkout: async (bookingId: string): Promise<CheckoutResponse> => {
    const res = await apiFetch('/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<CheckoutResponse>;
  },


  // Places (or resumes) the deposit once it opens — the checkout response
  // returns status SCHEDULED with opensAt before that.
  deposit: async (bookingId: string): Promise<DepositView | null> => {
    const res = await apiFetch('/payments/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<DepositView | null>;
  },
};
