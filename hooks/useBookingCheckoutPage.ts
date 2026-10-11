'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Stripe, StripeElements, StripePaymentElementOptions } from '@stripe/stripe-js';
import { bookingService } from '@/services/booking.service';
import { paymentService } from '@/services/payment.service';
import { useAuthStore } from '@/store/auth.store';
import type { CheckoutUiState, PaymentStatus } from '@/types/payment';

// Statuses in which the renter has already paid — mirrors
// PaymentsService.ALREADY_PAID_STATUSES on the backend, which is the real
// source of truth (this is only used to skip re-requesting a PaymentIntent
// we already know is settled).
const ALREADY_PAID_STATUSES: PaymentStatus[] = [
  'HELD',
  'RELEASING',
  'TRANSFERRED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

export function useBookingCheckoutPage(bookingId: string) {
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.token);
  const searchParams = useSearchParams();

  const {
    data: booking,
    isLoading: isLoadingBooking,
    isError: isBookingError,
    refetch: refetchBooking,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getById(bookingId),
    enabled: hydrated && !!token && !!bookingId,
  });

  const alreadyPaid = !!booking?.payment && ALREADY_PAID_STATUSES.includes(booking.payment.status);
  const canCheckout = !!booking && booking.status === 'CONFIRMED' && !alreadyPaid;

  // Idempotent on the backend (resumes the existing PaymentIntent for this
  // booking rather than creating a new one) — modeled as a query, not a
  // mutation, so React Query's own de-duplication is the double-click/
  // double-mount guard, on top of the backend's own idempotency key.
  const {
    data: checkout,
    isSuccess: isCheckoutReady,
    isLoading: isCreatingIntent,
    isError: isCheckoutError,
    error: checkoutError,
  } = useQuery({
    queryKey: ['payments', 'checkout', bookingId],
    queryFn: () => paymentService.checkout(bookingId),
    enabled: canCheckout,
    staleTime: Infinity,
    retry: false,
  });

  // The checkout response only carries the clientSecret — the full
  // breakdown (platformFeeAmount, ownerAmount, disputeWindowEndsAt) lives on
  // booking.payment, populated by GET /bookings/:id. Refetch once so the
  // price breakdown can read numbers straight from the backend instead of
  // re-deriving them from the checkout response.
  const refetchedAfterCheckout = useRef(false);
  useEffect(() => {
    if (isCheckoutReady && !refetchedAfterCheckout.current) {
      refetchedAfterCheckout.current = true;
      void refetchBooking();
    }
  }, [isCheckoutReady, refetchBooking]);

  // Resolve a 3DS return (?payment_intent=...&redirect_status=...) instead
  // of re-submitting — derived straight into the initial state so there's
  // no setState-in-effect render cascade; searchParams is already available
  // synchronously on first render.
  const [uiState, setUiState] = useState<CheckoutUiState>(() => {
    const redirectStatus = searchParams.get('redirect_status');
    if (redirectStatus === 'succeeded') return 'succeeded';
    if (redirectStatus === 'processing') return 'requires_action';
    if (redirectStatus) return 'failed';
    return 'idle';
  });
  const [confirmError, setConfirmError] = useState<unknown>(null);
  const submittingRef = useRef(false);

  // A successful 3DS return means the booking's payment status is now
  // stale in the cache — pull the fresh one. This is an imperative refetch,
  // not a setState, so it belongs in an effect.
  useEffect(() => {
    if (searchParams.get('redirect_status') === 'succeeded') {
      void refetchBooking();
    }
    // Only react to the redirect once, on mount — not on every refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pay(stripe: Stripe | null, elements: StripeElements | null) {
    if (!stripe || !elements) return;
    if (submittingRef.current || uiState === 'submitting' || uiState === 'succeeded') return;

    submittingRef.current = true;
    setUiState('submitting');
    setConfirmError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}`,
      },
      redirect: 'if_required',
    });

    submittingRef.current = false;

    if (error) {
      setConfirmError(error);
      // A card-form validation error (e.g. incomplete number) never left
      // this page — let the user fix the field and try again immediately.
      setUiState(error.type === 'validation_error' ? 'idle' : 'failed');
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      setUiState('succeeded');
      void refetchBooking();
    } else if (paymentIntent?.status === 'processing' || paymentIntent?.status === 'requires_action') {
      setUiState('requires_action');
    } else {
      setUiState('idle');
    }
  }

  function retry() {
    setUiState('idle');
    setConfirmError(null);
  }

  const paymentElementOptions: StripePaymentElementOptions = { layout: 'tabs' };

  return {
    booking,
    isLoadingBooking,
    isBookingError,
    alreadyPaid,
    canCheckout,
    checkout,
    isCheckoutReady,
    isCreatingIntent,
    isCheckoutError,
    checkoutError,
    uiState,
    confirmError,
    pay,
    retry,
    paymentElementOptions,
  };
}
