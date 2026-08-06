'use client';

import { use } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Stripe as StripeType, StripeElements } from '@stripe/stripe-js';
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';
import { Section } from '@/components/common/Section';
import { useBookingCheckoutPage } from '@/hooks/useBookingCheckoutPage';
import { getStripe } from '@/lib/stripe';
import { formatMoney } from '@/lib/formatMoney';
import { mapErrorToMessage } from '@/lib/apiError';

export default function BookingCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PrivateRoute>
      <BookingCheckoutContent bookingId={id} />
    </PrivateRoute>
  );
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-2 text-sm text-text-muted">
      {children}
    </main>
  );
}

function BookingCheckoutContent({ bookingId }: { bookingId: string }) {
  const t = useTranslations('payments');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const page = useBookingCheckoutPage(bookingId);

  if (page.isLoadingBooking) {
    return (
      <CenteredState>
        <Spinner size="sm" />
        {t('loadingBooking')}
      </CenteredState>
    );
  }

  if (page.isBookingError || !page.booking) {
    return <CenteredState>{t('bookingNotFound')}</CenteredState>;
  }

  const { booking } = page;
  const payment = booking.payment;

  // Before the first POST /payments/checkout, all we know is the booking's
  // own Decimal totals (major EUR units) — convert once, here. Once
  // booking.payment exists (after checkout + the refetch in the hook),
  // every number below comes straight from the backend, already in cents.
  const rentalMinorUnits = payment?.amountTotal ?? Math.round(booking.totalPrice * 100);
  const depositMinorUnits = page.checkout?.deposit?.amount ?? Math.round(booking.depositAmount * 100);
  const totalMinorUnits = rentalMinorUnits + depositMinorUnits;
  const currency = payment?.currency ?? 'eur';

  const payoutDate = payment?.disputeWindowEndsAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(payment.disputeWindowEndsAt))
    : null;

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
      <Link
        href="/bookings"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
      >
        <ArrowLeft size={14} />
        {t('backToBookings')}
      </Link>

      <div className="bg-bg-card rounded-2xl shadow-sm p-5">
        <Section title={t('priceBreakdown')}>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>{t('rental')}</span>
              <span>{formatMoney(rentalMinorUnits, currency, locale)}</span>
            </div>
            {payment && payment.platformFeeAmount > 0 && (
              <p className="text-xs text-text-muted">
                {t('serviceFeeNote', { amount: formatMoney(payment.platformFeeAmount, currency, locale) })}
              </p>
            )}
            {depositMinorUnits > 0 && (
              <div className="flex justify-between text-text-secondary">
                <span>{t('deposit')}</span>
                <span>{formatMoney(depositMinorUnits, currency, locale)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border-default pt-2 font-semibold text-text-base">
              <span>{t('total')}</span>
              <span className="text-brand">{formatMoney(totalMinorUnits, currency, locale)}</span>
            </div>
          </div>
        </Section>
      </div>

      <div className="bg-bg-card rounded-2xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">{t('holdExplanation')}</p>
        </div>
        <p className="text-xs text-text-muted pl-[30px]">
          {payoutDate ? t('payoutEtaKnown', { date: payoutDate }) : t('payoutEtaUnknown')}
        </p>
        {depositMinorUnits > 0 && (
          <p className="text-xs text-text-muted pl-[30px]">{t('depositExplanation')}</p>
        )}
      </div>

      <CheckoutBody bookingId={bookingId} page={page} t={t} tCommon={tCommon} />
    </main>
  );
}

type PageState = ReturnType<typeof useBookingCheckoutPage>;

function CheckoutBody({
  bookingId,
  page,
  t,
  tCommon,
}: {
  bookingId: string;
  page: PageState;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  if (page.alreadyPaid || page.uiState === 'succeeded') {
    return (
      <div className="bg-bg-card rounded-2xl shadow-sm p-5 flex flex-col items-center gap-2 text-center">
        <CheckCircle2 size={28} className="text-brand" />
        <p className="font-semibold text-text-base">{t('stateSucceededTitle')}</p>
        <p className="text-sm text-text-muted">{t('stateSucceededDetail')}</p>
      </div>
    );
  }

  if (!page.canCheckout) {
    return (
      <div className="bg-bg-card rounded-2xl shadow-sm p-5 text-sm text-text-muted">
        {t('notConfirmedYet')}
      </div>
    );
  }

  if (page.isCreatingIntent || !page.checkout) {
    return (
      <div className="bg-bg-card rounded-2xl shadow-sm p-5 flex items-center justify-center gap-2 text-sm text-text-muted">
        <Spinner size="sm" />
        {tCommon('loading')}
      </div>
    );
  }

  if (page.isCheckoutError) {
    return (
      <div className="bg-bg-card rounded-2xl shadow-sm p-5 text-sm text-text-error">
        {mapErrorToMessage(page.checkoutError, t, tCommon('error'))}
      </div>
    );
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{ clientSecret: page.checkout.payment.clientSecret }}
    >
      <PaymentForm bookingId={bookingId} page={page} t={t} tCommon={tCommon} />
    </Elements>
  );
}

function PaymentForm({
  page,
  t,
  tCommon,
}: {
  bookingId: string;
  page: PageState;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  const stripe = useStripe();
  const elements = useElements();

  function handlePay(stripeInstance: StripeType | null, elementsInstance: StripeElements | null) {
    void page.pay(stripeInstance, elementsInstance);
  }

  return (
    <div className="bg-bg-card rounded-2xl shadow-sm p-5 flex flex-col gap-4">
      <PaymentElement options={page.paymentElementOptions} />

      {page.uiState === 'requires_action' && (
        <p className="text-sm text-text-secondary">{t('stateRequiresAction')}</p>
      )}

      {page.uiState === 'failed' && (
        <div className="flex items-start gap-2 text-sm text-text-error">
          <XCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span>{mapErrorToMessage(page.confirmError, t, tCommon('error'))}</span>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!stripe || !elements || page.uiState === 'submitting'}
        onClick={() => handlePay(stripe, elements)}
      >
        {page.uiState === 'submitting'
          ? t('payButtonProcessing')
          : page.uiState === 'failed'
            ? t('retry')
            : t('payButton')}
      </Button>
    </div>
  );
}
