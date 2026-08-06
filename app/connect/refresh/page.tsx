'use client';

import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import Button from '@/components/atoms/Button';
import { useConnectStatus } from '@/hooks/useConnectStatus';

// Stripe redirects here when an onboarding link (account_onboarding
// AccountLink) has expired before the owner finished the flow — links are
// short-lived by design, so the only recovery is asking for a fresh one.
export default function ConnectRefreshPage() {
  return (
    <PrivateRoute>
      <ConnectRefreshContent />
    </PrivateRoute>
  );
}

function ConnectRefreshContent() {
  const t = useTranslations('connect.refresh');
  const { startOnboarding, isStartingOnboarding } = useConnectStatus();

  return (
    <main className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
      <RefreshCw size={32} className="text-text-muted" />
      <div>
        <p className="font-semibold text-text-base">{t('title')}</p>
        <p className="text-sm text-text-muted mt-1">{t('body')}</p>
      </div>
      <Button onClick={() => startOnboarding()} loading={isStartingOnboarding}>
        {t('cta')}
      </Button>
    </main>
  );
}
