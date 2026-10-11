'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { useAuthStore } from '@/store/auth.store';
import { ACTIVE_BOOKING_STATUSES, ENDED_BOOKING_STATUSES } from '@/lib/bookingStatus';

export type MyBookingsTab = 'all' | 'active' | 'completed' | 'cancelled';

export function useMyBookingsPage() {
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MyBookingsTab>('all');

  const { data: allBookings = [], isLoading, isError } = useQuery({
    queryKey: ['bookings', 'my', userId],
    queryFn: () => bookingService.getMy(),
    enabled: hydrated && !!token && !!userId,
    refetchInterval: 5000,
    refetchOnMount: 'always',
  });

  const [actionError, setActionError] = useState<unknown>(null);

  const { mutate: cancel, isPending: isCancelling } = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'my'] });
    },
    onError: setActionError,
  });

  const bookings = allBookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ACTIVE_BOOKING_STATUSES.includes(b.status);
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    return ENDED_BOOKING_STATUSES.includes(b.status);
  });

  return {
    bookings,
    isLoading,
    isError,
    activeTab,
    setActiveTab,
    cancel,
    isCancelling,
    actionError,
    clearActionError: () => setActionError(null),
  };
}
