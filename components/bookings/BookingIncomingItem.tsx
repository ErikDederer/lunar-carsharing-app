'use client';

import { Car, Check, X, Flag, Mail, Phone, KeyRound, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { formatBookingDates, bookingCarName, bookingCarPhoto } from '@/lib/formatBookingDates';
import { formatMoney } from '@/lib/formatMoney';
import { BOOKING_BADGE, hasStarted, isDepositSecured, isPaid } from '@/lib/bookingStatus';
import type { Booking } from '@/types/booking';

interface BookingIncomingItemProps {
  booking: Booking;
  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
  onPickup: (id: string) => void;
  onComplete: (id: string) => void;
  disabled: boolean;
}

// Owner's view of one booking. The available action follows the rental
// lifecycle: confirm/decline → (renter pays) → hand over → car returned.
export function BookingIncomingItem({
  booking,
  onConfirm,
  onDecline,
  onPickup,
  onComplete,
  disabled,
}: BookingIncomingItemProps) {
  const t = useTranslations('incomingBookings');
  const locale = useLocale();
  const photo = bookingCarPhoto(booking.car);
  const paid = isPaid(booking);
  const depositOk = isDepositSecured(booking);
  const started = hasStarted(booking);

  return (
    <div className="bg-bg-card rounded-2xl shadow-sm border border-border-default p-4 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl border border-border-default bg-bg-disabled flex items-center justify-center shrink-0 overflow-hidden">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={bookingCarName(booking.car)} className="w-full h-full object-cover" />
          ) : (
            <Car size={22} className="text-text-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-base truncate">{bookingCarName(booking.car)}</p>
          <p className="text-sm text-text-muted">{formatBookingDates(booking.startAt, booking.endAt)}</p>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1 truncate">
            <Mail size={12} className="shrink-0" />
            {booking.renter?.email ?? '—'}
          </p>
          {booking.renter?.phone && (
            <a
              href={`tel:${booking.renter.phone}`}
              className="text-xs text-brand mt-0.5 flex items-center gap-1 hover:underline"
            >
              <Phone size={12} className="shrink-0" />
              {booking.renter.phone}
            </a>
          )}
        </div>

        <Badge
          variant={BOOKING_BADGE[booking.status]}
          size="sm"
          label={t(`status.${booking.status}`)}
          className="min-w-0 shrink-0"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <p className="text-base font-bold text-text-base">
            {formatMoney(booking.totalPriceCents, booking.currency, locale)}
          </p>
          {booking.status === 'CONFIRMED' && (
            <p className="text-xs text-text-muted flex items-center gap-1">
              {paid ? (
                <>
                  <Check size={12} className="text-brand" />
                  {depositOk ? t('paid') : t('paidDepositPending')}
                </>
              ) : (
                <>
                  <Clock size={12} />
                  {t('awaitingPayment')}
                </>
              )}
            </p>
          )}
        </div>

        {booking.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button variant="danger-outline" size="sm" leftIcon={<X size={14} />} onClick={() => onDecline(booking.id)} disabled={disabled}>
              {t('decline')}
            </Button>
            <Button size="sm" leftIcon={<Check size={14} />} onClick={() => onConfirm(booking.id)} disabled={disabled}>
              {t('confirm')}
            </Button>
          </div>
        )}

        {booking.status === 'CONFIRMED' && paid && depositOk && (
          <Button
            size="sm"
            leftIcon={<KeyRound size={14} />}
            onClick={() => onPickup(booking.id)}
            disabled={disabled || !started}
          >
            {t('pickup')}
          </Button>
        )}

        {booking.status === 'CONFIRMED' && !paid && (
          <Button variant="danger-outline" size="sm" leftIcon={<X size={14} />} onClick={() => onDecline(booking.id)} disabled={disabled}>
            {t('cancelBooking')}
          </Button>
        )}

        {booking.status === 'IN_PROGRESS' && (
          <Button size="sm" leftIcon={<Flag size={14} />} onClick={() => onComplete(booking.id)} disabled={disabled}>
            {t('complete')}
          </Button>
        )}
      </div>

      {booking.status === 'CONFIRMED' && paid && depositOk && !started && (
        <p className="text-xs text-text-muted -mt-2">{t('pickupFromStart')}</p>
      )}
    </div>
  );
}
