'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { useAuthStore } from '@/store/auth.store';

export type IncomingFilterTab = 'all' | 'pending' | 'confirmed';

export function useIncomingBookingsPage() {
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<IncomingFilterTab>('all');

  const { data: allBookings = [], isLoading, isError } = useQuery({
    queryKey: ['bookings', 'incoming', userId],
    queryFn: () => bookingService.getIncoming(),
    enabled: hydrated && !!token && !!userId,
    refetchInterval: 5000,
    refetchOnMount: 'always',
  });

  // Last action error, shown as a toast by the page (null = none)
  const [actionError, setActionError] = useState<unknown>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bookings', 'incoming'] });
  const handlers = { onSuccess: invalidate, onError: setActionError };

  const { mutate: confirm, isPending: isConfirming } = useMutation({
    mutationFn: (id: string) => bookingService.confirm(id),
    ...handlers,
  });

  const { mutate: decline, isPending: isDeclining } = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    ...handlers,
  });

  const { mutate: pickup, isPending: isPickingUp } = useMutation({
    mutationFn: (id: string) => bookingService.pickup(id),
    ...handlers,
  });

  const { mutate: complete, isPending: isCompleting } = useMutation({
    mutationFn: (id: string) => bookingService.complete(id),
    ...handlers,
  });

  const bookings = allBookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return b.status === 'PENDING';
    return b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS';
  });

  const pendingCount = allBookings.filter((b) => b.status === 'PENDING').length;

  return {
    bookings,
    isLoading,
    isError,
    activeTab,
    setActiveTab,
    confirm,
    decline,
    pickup,
    complete,
    isMutating: isConfirming || isDeclining || isPickingUp || isCompleting,
    actionError,
    clearActionError: () => setActionError(null),
    pendingCount,
  };
}
