'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/atoms/Select';
import type { PayoutPeriodFilter, PayoutStatusFilter } from '@/hooks/usePayoutsPage';
import type { PayoutStatus } from '@/types/payout';

const STATUSES: PayoutStatus[] = ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'DEAD_LETTER'];

interface PayoutsFiltersProps {
  statusFilter: PayoutStatusFilter;
  onStatusChange: (value: PayoutStatusFilter) => void;
  periodFilter: PayoutPeriodFilter;
  onPeriodChange: (value: PayoutPeriodFilter) => void;
}

export function PayoutsFilters({
  statusFilter,
  onStatusChange,
  periodFilter,
  onPeriodChange,
}: PayoutsFiltersProps) {
  const t = useTranslations('payouts');

  const statusOptions = [
    { value: 'all', label: t('statusAll') },
    ...STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) })),
  ];

  const periodOptions = [
    { value: 'all', label: t('periodAll') },
    { value: '30d', label: t('period30d') },
    { value: '90d', label: t('period90d') },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        options={statusOptions}
        value={statusFilter}
        onChange={(value) => onStatusChange(value as PayoutStatusFilter)}
        className="min-w-40"
      />
      <Select
        options={periodOptions}
        value={periodFilter}
        onChange={(value) => onPeriodChange(value as PayoutPeriodFilter)}
        className="min-w-40"
      />
    </div>
  );
}
