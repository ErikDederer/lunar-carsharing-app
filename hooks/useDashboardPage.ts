'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carService } from '@/services/car.service';
import { useAuthStore } from '@/store/auth.store';
import { useConnectStatus } from '@/hooks/useConnectStatus';
import type { CarStatus } from '@/types/car';

export function useDashboardPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s._hydrated);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const {
    data: connectStatus,
    isLoading: isLoadingConnectStatus,
    startOnboarding,
    isStartingOnboarding,
    startOnboardingError,
  } = useConnectStatus();
  // transfersActive (not payoutsEnabled!) is what actually unblocks booking
  // creation server-side (see BookingsService.createBooking's Connect gate,
  // which checks StripeAccount.transfersActive) — Stripe can flip
  // payouts_enabled true before the transfers capability itself is active,
  // so gating on payoutsEnabled here let owners think they were done while
  // their cars still couldn't be booked.
  const needsPayoutSetup = !isLoadingConnectStatus && !!connectStatus && !connectStatus.transfersActive;

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars', 'me', userId],
    queryFn: () => carService.getMine(),
    enabled: hydrated && !!token && !!userId,
    refetchInterval: 5000,
  });

  const { mutate: toggleStatus, isPending: isTogglingStatus, variables: togglingId } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      carService.update(id, { carStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });

  function handleToggleStatus(id: string, currentStatus: CarStatus) {
    const next = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatus({ id, status: next });
  }

  const { mutate: removeCar, isPending: isRemoving, variables: removingId } = useMutation({
    mutationFn: (id: string) => carService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });

  function handleRemoveCar(id: string) {
    removeCar(id);
  }

  function goToEdit(id: string) {
    router.push(`/cars/${id}/edit`);
  }

  function goToSlots(id: string) {
    router.push(`/cars/${id}/slots`);
  }

  function goToNewCar() {
    router.push('/cars/new');
  }

  return {
    cars,
    isLoading,
    goToEdit,
    goToSlots,
    goToNewCar,
    handleToggleStatus,
    isTogglingStatus,
    togglingId: togglingId?.id,
    handleRemoveCar,
    isRemoving,
    removingId,
    needsPayoutSetup,
    startOnboarding,
    isStartingOnboarding,
    startOnboardingError,
  };
}
