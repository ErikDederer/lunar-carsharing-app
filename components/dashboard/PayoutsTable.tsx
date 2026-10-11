'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Wallet } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { formatMoney } from '@/lib/formatMoney';
import type { Payout, PayoutStatus } from '@/types/payout';

const STATUS_BADGE_VARIANT: Record<PayoutStatus, 'pending' | 'completed' | 'cancelled'> = {
  PENDING: 'pending',
  PROCESSING: 'pending',
  SUCCEEDED: 'completed',
  FAILED: 'cancelled',
  DEAD_LETTER: 'cancelled',
};

interface PayoutsTableProps {
  payouts: Payout[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasAnyPayouts: boolean;
}

function SkeletonRow() {
  return (
    <tr className="border-t border-border-default">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-4 w-full max-w-24 animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}

export function PayoutsTable({ payouts, isLoading, isError, isEmpty, hasAnyPayouts }: PayoutsTableProps) {
  const t = useTranslations('payouts');
  const locale = useLocale();
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  if (isError) {
    return <p className="text-sm text-text-error py-8 text-center">{t('loadError')}</p>;
  }

  if (!isLoading && isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="w-16 h-16 bg-bg-page rounded-full flex items-center justify-center text-text-disabled">
          <Wallet size={32} />
        </div>
        <p className="text-sm text-text-muted">{hasAnyPayouts ? t('emptyFiltered') : t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-default bg-bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-widest text-text-muted">
            <th className="px-3 py-3">{t('columnBooking')}</th>
            <th className="px-3 py-3">{t('columnGross')}</th>
            <th className="px-3 py-3">{t('columnFee')}</th>
            <th className="px-3 py-3">{t('columnNet')}</th>
            <th className="px-3 py-3">{t('columnStatus')}</th>
            <th className="px-3 py-3">{t('columnReleaseDate')}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            : payouts.map((payout) => {
                const currency = payout.booking.payment?.currency ?? 'eur';
                const grossMinorUnits = payout.amountOwner + payout.amountPlatform;
                const releaseDate = payout.executedAt ?? payout.booking.payment?.disputeWindowEndsAt;

                return (
                  <tr key={payout.id} className="border-t border-border-default text-text-secondary">
                    <td className="px-3 py-3 text-text-base font-medium">
                      {payout.booking.car.brand} {payout.booking.car.model}
                    </td>
                    <td className="px-3 py-3">{formatMoney(grossMinorUnits, currency, locale)}</td>
                    <td className="px-3 py-3">{formatMoney(payout.amountPlatform, currency, locale)}</td>
                    <td className="px-3 py-3 font-medium text-text-base">
                      {formatMoney(payout.amountOwner, currency, locale)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        size="sm"
                        variant={STATUS_BADGE_VARIANT[payout.status]}
                        label={t(`status.${payout.status}`)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      {releaseDate ? dateFormat.format(new Date(releaseDate)) : t('releaseDatePending')}
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
