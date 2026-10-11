'use client';

import Link from 'next/link';
import { Car } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import { MyBookingItem } from '@/components/bookings/MyBookingItem';
import { BookingsTabs } from '@/components/bookings/BookingsTabs';
import { useMyBookingsPage, type MyBookingsTab } from '@/hooks/useMyBookingsPage';
import { useMarkStatsSeen } from '@/hooks/useMarkStatsSeen';
import { Toast } from '@/components/common/Toast';
import { errorMessage } from '@/lib/errorMessage';

const TAB_KEYS: MyBookingsTab[] = ['all', 'active', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const t = useTranslations('myBookings');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const {
    bookings,
    isLoading,
    isError,
    activeTab,
    setActiveTab,
    cancel,
    isCancelling,
    actionError,
    clearActionError,
  } = useMyBookingsPage();
  useMarkStatsSeen('myBookings');

  return (
    <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-text-base">{t('title')}</h1>

      <BookingsTabs
        tabs={TAB_KEYS.map((key) => ({ id: key, label: t(`tabs.${key}`) }))}
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
        <div className="bg-bg-card rounded-2xl shadow-sm border border-border-default p-10 flex flex-col items-center gap-3">
          <Car size={32} className="text-text-disabled" />
          <p className="text-sm text-text-muted">{t('empty')}</p>
          <Link href="/search">
            <Button>{t('browseCars')}</Button>
          </Link>
        </div>
      )}

      {!isLoading && !isError && bookings.length > 0 && (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <MyBookingItem
              key={booking.id}
              booking={booking}
              onCancel={cancel}
              cancelling={isCancelling}
            />
          ))}
        </div>
      )}
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
