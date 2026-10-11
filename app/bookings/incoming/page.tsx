'use client';

import { Car } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Spinner from '@/components/atoms/Spinner';
import { BookingIncomingItem } from '@/components/bookings/BookingIncomingItem';
import { BookingsTabs } from '@/components/bookings/BookingsTabs';
import { useIncomingBookingsPage, type IncomingFilterTab } from '@/hooks/useIncomingBookingsPage';
import { useMarkStatsSeen } from '@/hooks/useMarkStatsSeen';
import { Toast } from '@/components/common/Toast';
import { errorMessage } from '@/lib/errorMessage';
import { Reveal } from '@/components/motion/Reveal';

const TAB_KEYS: IncomingFilterTab[] = ['all', 'pending', 'confirmed'];

export default function IncomingBookingsPage() {
  const t = useTranslations('incomingBookings');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const {
    bookings,
    isLoading,
    isError,
    activeTab,
    setActiveTab,
    confirm,
    decline,
    pickup,
    complete,
    isMutating,
    pendingCount,
    actionError,
    clearActionError,
  } = useIncomingBookingsPage();
  useMarkStatsSeen('incoming');

  return (
    <div className="min-h-screen bg-bg-page py-8 px-4">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-text-base">{t('title')}</h1>

        <BookingsTabs
          tabs={TAB_KEYS.map((key) => ({
            id: key,
            label: t(`tabs.${key}`),
            badge: key === 'pending' ? pendingCount : undefined,
          }))}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-muted">
            <Spinner size="sm" /> {tCommon('loading')}
          </div>
        )}

        {isError && (
          <p className="text-sm text-text-error text-center py-10">{tCommon('error')}</p>
        )}

        {!isLoading && !isError && bookings.length === 0 && (
          <div className="bg-bg-card rounded-2xl shadow-sm border border-border-default p-10 flex flex-col items-center gap-2">
            <Car size={32} className="text-text-disabled" />
            <p className="text-sm text-text-muted">{t('empty')}</p>
          </div>
        )}

        {!isLoading && !isError && bookings.length > 0 && (
          <Reveal className="flex flex-col gap-3" watch={bookings.map((b) => b.id).join()}>
            {bookings.map((booking) => (
              <BookingIncomingItem
                key={booking.id}
                booking={booking}
                onConfirm={confirm}
                onDecline={decline}
                onPickup={pickup}
                onComplete={complete}
                disabled={isMutating}
              />
            ))}
          </Reveal>
        )}
      </div>
      {actionError !== null && (
        <Toast
          type="error"
          message={errorMessage(actionError, tErrors, tCommon('error'))}
          onClose={clearActionError}
        />
      )}
    </div>
  );
}
