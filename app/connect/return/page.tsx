'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock } from 'lucide-react';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';
import { connectService } from '@/services/connect.service';
import { useAuthStore } from '@/store/auth.store';

// Widening backoff (Stripe's account.updated webhook can lag a little
// behind the redirect) — stop polling after MAX_ATTEMPTS rather than
// forever, and let the user manually check again from there.
const BACKOFF_MS = [2000, 4000, 8000, 15000];
const MAX_ATTEMPTS = 6;

export default function ConnectReturnPage() {
  return (
    <PrivateRoute>
      <ConnectReturnContent />
    </PrivateRoute>
  );
}

function ConnectReturnContent() {
  const t = useTranslations('connect.return');
  const router = useRouter();
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.token);

  const { data: status, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['connect', 'status'],
    queryFn: () => connectService.getStatus(),
    enabled: hydrated && !!token,
    refetchInterval: (query) => {
      if (query.state.data?.payoutsEnabled) return false;
      const attempt = query.state.dataUpdateCount;
      if (attempt >= MAX_ATTEMPTS) return false;
      return BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
    },
  });

  const ready = !!status?.payoutsEnabled;

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => router.replace('/dashboard'), 1500);
    return () => window.clearTimeout(timeout);
  }, [ready, router]);

  return (
    <main className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
      {ready ? (
        <>
          <CheckCircle2 size={32} className="text-brand" />
          <div>
            <p className="font-semibold text-text-base">{t('success')}</p>
            <p className="text-sm text-text-muted mt-1">{t('successBody')}</p>
          </div>
          <Button onClick={() => router.replace('/dashboard')}>{t('goToDashboard')}</Button>
        </>
      ) : isLoading ? (
        <>
          <Spinner size="md" />
          <p className="text-sm text-text-muted">{t('checking')}</p>
        </>
      ) : (
        <>
          <Clock size={32} className="text-text-muted" />
          <div>
            <p className="font-semibold text-text-base">{t('pending')}</p>
            <p className="text-sm text-text-muted mt-1">{t('pendingBody')}</p>
          </div>
          {isRefetching ? (
            <Spinner size="sm" />
          ) : (
            <Button variant="secondary" onClick={() => refetch()}>
              {t('checkAgain')}
            </Button>
          )}
        </>
      )}
    </main>
  );
}
