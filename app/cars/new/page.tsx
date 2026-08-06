'use client';

import { useTranslations } from 'next-intl';
import { ShieldAlert } from 'lucide-react';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { CarForm } from '@/components/cars/CarForm';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';
import { useConnectStatus } from '@/hooks/useConnectStatus';
import { mapErrorToMessage } from '@/lib/apiError';

export default function CarNewPage() {
  return (
    <PrivateRoute>
      <CarNewGate />
    </PrivateRoute>
  );
}

// Only gates creation — an owner already mid-onboarding shouldn't lose
// access to editing listings they published before payouts existed.
function CarNewGate() {
  const { data: status, isLoading, startOnboarding, isStartingOnboarding, startOnboardingError } =
    useConnectStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="md" />
      </div>
    );
  }

  if (!status?.payoutsEnabled) {
    return (
      <PayoutSetupRequired
        onStart={() => startOnboarding()}
        starting={isStartingOnboarding}
        error={startOnboardingError}
      />
    );
  }

  return <CarForm mode="create" />;
}

function PayoutSetupRequired({
  onStart,
  starting,
  error,
}: {
  onStart: () => void;
  starting: boolean;
  error?: unknown;
}) {
  const t = useTranslations('connect.gate');
  const tConnect = useTranslations('connect');
  const tCommon = useTranslations('common');

  return (
    <main className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
      <ShieldAlert size={32} className="text-orange-600" />
      <div>
        <p className="font-semibold text-text-base">{t('title')}</p>
        <p className="text-sm text-text-muted mt-1">{t('body')}</p>
      </div>
      <Button onClick={onStart} loading={starting}>
        {t('cta')}
      </Button>
      {error !== undefined && error !== null && (
        <p className="text-xs text-text-error">{mapErrorToMessage(error, tConnect, tCommon('error'))}</p>
      )}
    </main>
  );
}
