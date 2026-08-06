'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/atoms/Button';
import { mapErrorToMessage } from '@/lib/apiError';

interface PayoutSetupBannerProps {
  onStart: () => void;
  starting: boolean;
  error?: unknown;
}

export function PayoutSetupBanner({ onStart, starting, error }: PayoutSetupBannerProps) {
  const t = useTranslations('connect.banner');
  const tConnect = useTranslations('connect');
  const tCommon = useTranslations('common');

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <AlertTriangle size={18} className="text-orange-600 shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2">
        <div>
          <p className="text-sm font-semibold text-orange-800">{t('title')}</p>
          <p className="text-sm text-orange-700">{t('body')}</p>
        </div>
        <Button size="sm" onClick={onStart} loading={starting} className="self-start">
          {t('cta')}
        </Button>
        {error !== undefined && error !== null && (
          <p className="text-xs text-text-error">{mapErrorToMessage(error, tConnect, tCommon('error'))}</p>
        )}
      </div>
    </div>
  );
}
