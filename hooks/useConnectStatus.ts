'use client';

import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { connectService } from '@/services/connect.service';
import { useAuthStore } from '@/store/auth.store';
import type { ConnectStatus } from '@/types/connect';

// Shared by the dashboard banner, the /connect/return polling screen and
// the car-creation payout gate — one query key (['connect','status']) so
// a mutation anywhere in the app can invalidate all three with the same
// precise key instead of guessing.
export function useConnectStatus(options?: Partial<UseQueryOptions<ConnectStatus>>) {
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.token);

  const query = useQuery({
    queryKey: ['connect', 'status'],
    queryFn: () => connectService.getStatus(),
    enabled: hydrated && !!token,
    ...options,
  });

  const {
    mutate: startOnboarding,
    isPending: isStartingOnboarding,
    error: startOnboardingError,
  } = useMutation({
    mutationFn: () => connectService.createOnboardingLink(),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  return { ...query, startOnboarding, isStartingOnboarding, startOnboardingError };
}
