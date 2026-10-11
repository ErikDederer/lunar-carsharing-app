'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Stripe, StripeElements, StripePaymentElementOptions } from '@stripe/stripe-js';
import { bookingService } from '@/services/booking.service';
import { paymentService } from '@/services/payment.service';
import { useAuthStore } from '@/store/auth.store';
import { isDepositSecured, isPaid } from '@/lib/bookingStatus';
import type { CheckoutUiState } from '@/types/payment';

// Confirms one PaymentIntent with Stripe.js. The result on the client is
// never final — the server learns it from the Stripe webhook, so callers
// poll the booking afterwards.
async function confirmWithStripe(
  stripe: Stripe,
  elements: StripeElements,
  returnUrl: string,
): Promise<{ state: CheckoutUiState; error: unknown }> {
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: returnUrl },
    redirect: 'if_required',
  });
  if (error) {
    // A form validation error (e.g. incomplete number) never left the page
    return { state: error.type === 'validation_error' ? 'idle' : 'failed', error };
  }
  const status = paymentIntent?.status;
  if (status === 'succeeded' || status === 'requires_capture') {
    return { state: 'succeeded', error: null };
  }
  if (status === 'processing' || status === 'requires_action') {
    return { state: 'requires_action', error: null };
  }
  return { state: 'idle', error: null };
}

function useConfirmStep(returnUrl: string, onSucceeded: () => void, initial: CheckoutUiState = 'idle') {
  const [uiState, setUiState] = useState<CheckoutUiState>(initial);
  const [error, setError] = useState<unknown>(null);
  const submitting = useRef(false);

  async function confirm(stripe: Stripe | null, elements: StripeElements | null) {
    if (!stripe || !elements || submitting.current || uiState === 'succeeded') return;
    submitting.current = true;
    setUiState('submitting');
    setError(null);
    const result = await confirmWithStripe(stripe, elements, returnUrl);
    submitting.current = false;
    setUiState(result.state);
    setError(result.error);
    if (result.state === 'succeeded') onSucceeded();
  }

  return {
    uiState,
    error,
    confirm,
    retry: () => {
      setUiState('idle');
      setError(null);
    },
  };
}

export function useBookingCheckoutPage(bookingId: string) {
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.token);
  const searchParams = useSearchParams();
  // Which confirmation we're waiting for the webhook to apply. Derived
  // into `waitingForServer` below, so no effect is needed to stop polling.
  const [waitingFor, setWaitingFor] = useState<'none' | 'payment' | 'deposit'>(() =>
    searchParams.get('redirect_status') === 'succeeded' ? 'payment' : 'none',
  );

  const {
    data: booking,
    isLoading: isLoadingBooking,
    isError: isBookingError,
    refetch: refetchBooking,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getById(bookingId),
    enabled: hydrated && !!token && !!bookingId,
    // After a successful confirm, poll until the webhook has updated the
    // booking (payment HELD / deposit AUTHORIZED).
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current) return false;
      if (waitingFor === 'payment' && !isPaid(current)) return 2000;
      if (waitingFor === 'deposit' && !isDepositSecured(current)) return 2000;
      return false;
    },
  });

  const paid = !!booking && isPaid(booking);
  const depositSecured = !!booking && isDepositSecured(booking);
  const canCheckout = !!booking && booking.status === 'CONFIRMED' && !paid;
  const needsDeposit = !!booking && booking.status === 'CONFIRMED' && paid && !depositSecured;
  const waitingForServer =
    (waitingFor === 'payment' && !paid) || (waitingFor === 'deposit' && !depositSecured);

  // Idempotent on the backend (resumes the existing PaymentIntent) —
  // modeled as a query so React Query de-duplicates double mounts/clicks.
  const {
    data: checkout,
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

  // Deposit step, only once the rental is paid. Also idempotent; returns
  // SCHEDULED (+opensAt) while it's too early, a clientSecret while a card
  // has to be confirmed, or the secured status.
  const {
    data: deposit,
    isLoading: isLoadingDeposit,
    isError: isDepositError,
    error: depositError,
  } = useQuery({
    queryKey: ['payments', 'deposit', bookingId],
    queryFn: () => paymentService.deposit(bookingId),
    enabled: needsDeposit,
    retry: false,
    refetchInterval: (q) => (q.state.data?.status === 'SCHEDULED' ? 60_000 : false),
  });

  const returnUrl =
    typeof window === 'undefined' ? '' : `${window.location.origin}/bookings/${bookingId}`;

  const rental = useConfirmStep(
    returnUrl,
    () => {
      setWaitingFor('payment');
      void refetchBooking();
    },
    (() => {
      const redirectStatus = searchParams.get('redirect_status');
      if (redirectStatus === 'succeeded') return 'succeeded';
      if (redirectStatus === 'processing') return 'requires_action';
      if (redirectStatus) return 'failed';
      return 'idle';
    })(),
  );

  const depositStep = useConfirmStep(returnUrl, () => {
    setWaitingFor('deposit');
    void refetchBooking();
  });

  const paymentElementOptions: StripePaymentElementOptions = { layout: 'tabs' };

  return {
    booking,
    isLoadingBooking,
    isBookingError,
    paid,
    depositSecured,
    canCheckout,
    needsDeposit,
    waitingForServer,
    checkout,
    isCreatingIntent,
    isCheckoutError,
    checkoutError,
    rental,
    deposit,
    isLoadingDeposit,
    isDepositError,
    depositError,
    depositStep,
    paymentElementOptions,
  };
}
