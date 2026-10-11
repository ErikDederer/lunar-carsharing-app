'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payoutService } from '@/services/payout.service';
import { useAuthStore } from '@/store/auth.store';
import type { PayoutStatus } from '@/types/payout';

export type PayoutStatusFilter = 'all' | PayoutStatus;
export type PayoutPeriodFilter = 'all' | '30d' | '90d';

const PERIOD_MS: Record<Exclude<PayoutPeriodFilter, 'all'>, number> = {
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

// GET /payouts has no query params (see payouts.repository.ts) — the owner's
// full payout history is small enough to fetch once and filter client-side,
// the same pattern useIncomingBookingsPage already uses for its status tabs.
export function usePayoutsPage() {
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);

  const {
    data: payouts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['payouts', 'me', userId],
    queryFn: () => payoutService.getMine(),
    enabled: hydrated && !!token && !!userId,
  });

  const [statusFilter, setStatusFilter] = useState<PayoutStatusFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PayoutPeriodFilter>('all');
  // Captured once per mount instead of called inline during the filter —
  // Date.now() is impure and the "last 30/90 days" cutoff doesn't need
  // tighter precision than "whenever this screen was opened".
  const [now] = useState(() => Date.now());

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      if (statusFilter !== 'all' && payout.status !== statusFilter) return false;
      if (periodFilter !== 'all') {
        const age = now - new Date(payout.createdAt).getTime();
        if (age > PERIOD_MS[periodFilter]) return false;
      }
      return true;
    });
  }, [payouts, statusFilter, periodFilter, now]);

  return {
    payouts: filteredPayouts,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && filteredPayouts.length === 0,
    hasAnyPayouts: payouts.length > 0,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
  };
}
