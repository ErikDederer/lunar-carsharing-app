'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { PayoutsFilters } from '@/components/dashboard/PayoutsFilters';
import { PayoutsTable } from '@/components/dashboard/PayoutsTable';
import { usePayoutsPage } from '@/hooks/usePayoutsPage';

export default function PayoutsPage() {
  return (
    <PrivateRoute>
      <PayoutsPageContent />
    </PrivateRoute>
  );
}

function PayoutsPageContent() {
  const t = useTranslations('payouts');
  const {
    payouts,
    isLoading,
    isError,
    isEmpty,
    hasAnyPayouts,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
  } = usePayoutsPage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          {t('subtitle')}
        </Link>
        <h1 className="text-xl font-semibold text-text-base">{t('title')}</h1>
      </div>

      <PayoutsFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        periodFilter={periodFilter}
        onPeriodChange={setPeriodFilter}
      />

      <PayoutsTable
        payouts={payouts}
        isLoading={isLoading}
        isError={isError}
        isEmpty={isEmpty}
        hasAnyPayouts={hasAnyPayouts}
      />
    </div>
  );
}
