'use client';

import { use } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ArrowLeft, CalendarClock, CreditCard, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { AnimatedCheck } from '@/components/motion/AnimatedCheck';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';
import { Section } from '@/components/common/Section';
import { useBookingCheckoutPage } from '@/hooks/useBookingCheckoutPage';
import { getStripe } from '@/lib/stripe';
import { formatMoney } from '@/lib/formatMoney';
import { mapErrorToMessage } from '@/lib/apiError';
import { formatBookingDates, bookingCarName, bookingCarPhoto } from '@/lib/formatBookingDates';
import type { CheckoutUiState } from '@/types/payment';
import { Reveal } from '@/components/motion/Reveal';

export default function BookingCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PrivateRoute>
      <BookingCheckoutContent bookingId={id} />
    </PrivateRoute>
  );
}

type Translator = ReturnType<typeof useTranslations>;

// Sandbox keys only: show the Stripe test card so a demo can be paid.
const IS_TEST_MODE = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '').startsWith('pk_test_');
type PageState = ReturnType<typeof useBookingCheckoutPage>;

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg-card rounded-2xl shadow-sm border border-border-default p-5 ${className}`}>{children}</div>
  );
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-2 text-sm text-text-muted">
      {children}
    </main>
  );
}

function Done({ title, detail }: { title: string; detail?: string }) {
  return (
    <Card className="flex flex-col items-center gap-2 text-center">
      <AnimatedCheck />
      <p className="font-semibold text-text-base">{title}</p>
      {detail && <p className="text-sm text-text-muted">{detail}</p>}
    </Card>
  );
}

function Waiting({ label }: { label: string }) {
  return (
    <Card className="flex items-center justify-center gap-2 text-sm text-text-muted">
      <Spinner size="sm" />
      {label}
    </Card>
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
  const currency = booking.currency;
  const photo = bookingCarPhoto(booking.car);
  const fee =
    booking.payment && 'platformFeeAmount' in booking.payment ? booking.payment.platformFeeAmount : 0;
  const dueDate = booking.paymentDueAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(booking.paymentDueAt),
      )
    : null;

  return (
    <Reveal as="main" className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4" stagger={0.06} y={16}>
      <Link
        href="/bookings"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
      >
        <ArrowLeft size={14} />
        {t('backToBookings')}
      </Link>

      <Card className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-disabled shrink-0">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={bookingCarName(booking.car)} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text-base truncate">{bookingCarName(booking.car)}</p>
          <p className="text-sm text-text-muted">{formatBookingDates(booking.startAt, booking.endAt)}</p>
        </div>
      </Card>

      <Card>
        <Section title={t('priceBreakdown')}>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>{t('rental')}</span>
              <span>{formatMoney(booking.totalPriceCents, currency, locale)}</span>
            </div>
            {fee > 0 && (
              <p className="text-xs text-text-muted">
                {t('serviceFeeNote', { amount: formatMoney(fee, currency, locale) })}
              </p>
            )}
            {booking.depositAmountCents > 0 && (
              <div className="flex justify-between text-text-secondary">
                <span>{t('deposit')}</span>
                <span>{formatMoney(booking.depositAmountCents, currency, locale)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border-default pt-2 font-semibold text-text-base">
              <span>{t('totalRental')}</span>
              <span className="text-brand">{formatMoney(booking.totalPriceCents, currency, locale)}</span>
            </div>
            {booking.depositAmountCents > 0 && (
              <p className="text-xs text-text-muted">{t('depositSeparately')}</p>
            )}
          </div>
        </Section>
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">{t('holdExplanation')}</p>
        </div>
        {booking.depositAmountCents > 0 && (
          <p className="text-xs text-text-muted pl-[30px]">{t('depositExplanation')}</p>
        )}
      </Card>

      <StepTitle n={1} title={t('stepPayment')} done={page.paid} />
      <RentalStep page={page} t={t} tCommon={tCommon} dueDate={dueDate} />

      {booking.depositAmountCents > 0 && (
        <>
          <StepTitle n={2} title={t('stepDeposit')} done={page.depositSecured} />
          <DepositStep page={page} t={t} tCommon={tCommon} locale={locale} />
        </>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
        <Lock size={12} />
        {t('securedByStripe')}
      </p>
    </Reveal>
  );
}

function StepTitle({ n, title, done }: { n: number; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <span
        className={[
          'w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center',
          done ? 'bg-brand text-white' : 'bg-brand-subtle text-brand',
        ].join(' ')}
      >
        {done ? '✓' : n}
      </span>
      <h2 className="text-sm font-semibold text-text-base">{title}</h2>
    </div>
  );
}

function RentalStep({
  page,
  t,
  tCommon,
  dueDate,
}: {
  page: PageState;
  t: Translator;
  tCommon: Translator;
  dueDate: string | null;
}) {
  if (page.paid) return <Done title={t('stateSucceededTitle')} detail={t('stateSucceededDetail')} />;
  if (page.waitingForServer) return <Waiting label={t('confirmingPayment')} />;
  if (!page.canCheckout) return <Card className="text-sm text-text-muted">{t('notConfirmedYet')}</Card>;
  if (page.isCheckoutError) {
    return (
      <Card className="text-sm text-text-error">{mapErrorToMessage(page.checkoutError, t, tCommon('error'))}</Card>
    );
  }
  if (page.isCreatingIntent || !page.checkout) return <Waiting label={tCommon('loading')} />;

  return (
    <Elements stripe={getStripe()} options={{ clientSecret: page.checkout.payment.clientSecret }}>
      <ConfirmForm
        step={page.rental}
        options={page.paymentElementOptions}
        buttonLabel={t('payButton')}
        hint={dueDate ? t('payBy', { date: dueDate }) : null}
        t={t}
        tCommon={tCommon}
      />
    </Elements>
  );
}

function DepositStep({
  page,
  t,
  tCommon,
  locale,
}: {
  page: PageState;
  t: Translator;
  tCommon: Translator;
  locale: string;
}) {
  if (page.depositSecured) return <Done title={t('depositSecuredTitle')} detail={t('depositSecuredDetail')} />;
  if (!page.paid) return <Card className="text-sm text-text-muted">{t('depositAfterPayment')}</Card>;
  if (page.waitingForServer) return <Waiting label={t('confirmingDeposit')} />;
  if (page.isDepositError) {
    return (
      <Card className="text-sm text-text-error">{mapErrorToMessage(page.depositError, t, tCommon('error'))}</Card>
    );
  }
  if (page.isLoadingDeposit || !page.deposit) return <Waiting label={tCommon('loading')} />;

  const { deposit } = page;
  if (deposit.status === 'SCHEDULED' && deposit.opensAt) {
    const opens = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(deposit.opensAt),
    );
    return (
      <Card className="flex items-start gap-3">
        <CalendarClock size={18} className="text-brand shrink-0 mt-0.5" />
        <p className="text-sm text-text-secondary">{t('depositOpensAt', { date: opens })}</p>
      </Card>
    );
  }
  if (!deposit.clientSecret) return <Waiting label={t('confirmingDeposit')} />;

  return (
    <Elements stripe={getStripe()} options={{ clientSecret: deposit.clientSecret }}>
      <ConfirmForm
        step={page.depositStep}
        options={page.paymentElementOptions}
        buttonLabel={t('depositButton')}
        hint={deposit.holdStrategy === 'AUTH_HOLD' ? t('depositHoldHint') : t('depositChargeHint')}
        t={t}
        tCommon={tCommon}
      />
    </Elements>
  );
}

function ConfirmForm({
  step,
  options,
  buttonLabel,
  hint,
  t,
  tCommon,
}: {
  step: PageState['rental'];
  options: StripePaymentElementOptions;
  buttonLabel: string;
  hint: string | null;
  t: Translator;
  tCommon: Translator;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const state: CheckoutUiState = step.uiState;

  return (
    <Card className="flex flex-col gap-4">
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
      <PaymentElement options={options} />

      {state === 'requires_action' && <p className="text-sm text-text-secondary">{t('stateRequiresAction')}</p>}

      {state === 'failed' && (
        <div className="flex items-start gap-2 text-sm text-text-error">
          <XCircle size={16} className="shrink-0 mt-0.5" />
          <span>{mapErrorToMessage(step.error, t, tCommon('error'))}</span>
        </div>
      )}

      <Button
        className="w-full"
        leftIcon={<CreditCard size={16} />}
        disabled={!stripe || !elements || state === 'submitting'}
        onClick={() => void step.confirm(stripe, elements)}
      >
        {state === 'submitting' ? t('payButtonProcessing') : state === 'failed' ? t('retry') : buttonLabel}
      </Button>
      {IS_TEST_MODE && <p className="text-[11px] text-text-muted text-center">{t('testCardHint')}</p>}
    </Card>
  );
}
