'use client';

import Link from 'next/link';
import { Car, Phone, Mail, CreditCard, Check, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { formatBookingDates, bookingCarName, bookingCarPhoto, bookingOwner } from '@/lib/formatBookingDates';
import { formatMoney } from '@/lib/formatMoney';
import { BOOKING_BADGE, isDepositSecured, isPaid } from '@/lib/bookingStatus';
import type { Booking } from '@/types/booking';

interface MyBookingItemProps {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: boolean;
}

// Renter's view of one booking: pay once the owner confirmed, then the
// deposit; contact details of the owner once the booking holds the car.
export function MyBookingItem({ booking, onCancel, cancelling }: MyBookingItemProps) {
  const t = useTranslations('myBookings');
  const locale = useLocale();
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const photo = bookingCarPhoto(booking.car);
  const owner = bookingOwner(booking.car);
  const paid = isPaid(booking);
  const depositOk = isDepositSecured(booking);
  const needsAction = booking.status === 'CONFIRMED' && (!paid || !depositOk);
  const dueDate = booking.paymentDueAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(booking.paymentDueAt),
      )
    : null;

  return (
    <div
      className={[
        'bg-bg-card rounded-2xl shadow-sm border p-4 flex flex-col gap-3',
        needsAction ? 'border-brand' : 'border-border-default',
      ].join(' ')}
    >
      <Link href={`/cars/${booking.carId}`} className="flex items-center gap-3 group">
        <div className="w-14 h-14 rounded-xl border border-border-default bg-bg-disabled flex items-center justify-center shrink-0 overflow-hidden">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={bookingCarName(booking.car)} className="w-full h-full object-cover" />
          ) : (
            <Car size={22} className="text-text-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-base truncate group-hover:text-brand transition-colors">{bookingCarName(booking.car)}</p>
          <p className="text-sm text-text-muted">{formatBookingDates(booking.startAt, booking.endAt)}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {formatMoney(booking.totalPriceCents, booking.currency, locale)}
          </p>
        </div>

        <Badge
          variant={BOOKING_BADGE[booking.status]}
          size="sm"
          label={t(`status.${booking.status}`)}
          className="min-w-0 shrink-0"
        />
      </Link>

      {booking.status === 'CONFIRMED' && (
        <div className="flex items-center justify-between gap-3 border-t border-border-default pt-3">
          <p className="text-xs text-text-muted flex items-center gap-1">
            {paid && depositOk ? (
              <>
                <Check size={12} className="text-brand" />
                {t('paidAll')}
              </>
            ) : paid ? (
              <>
                <Clock size={12} />
                {t('depositNext')}
              </>
            ) : (
              <>
                <Clock size={12} />
                {dueDate ? t('payBy', { date: dueDate }) : t('payNowHint')}
              </>
            )}
          </p>
          {needsAction && (
            <Link href={`/bookings/${booking.id}`}>
              <Button size="sm" leftIcon={<CreditCard size={14} />}>
                {paid ? t('placeDeposit') : t('payNow')}
              </Button>
            </Link>
          )}
        </div>
      )}

      {owner && (owner.phone || owner.email) && (
        <div className="border-t border-border-default pt-3 flex flex-col gap-1">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('ownerContact')}</p>
          {owner.phone && (
            <a href={`tel:${owner.phone}`} className="text-sm text-brand flex items-center gap-1.5 hover:underline">
              <Phone size={13} className="shrink-0" />
              {owner.phone}
            </a>
          )}
          <a href={`mailto:${owner.email}`} className="text-sm text-text-secondary flex items-center gap-1.5 hover:underline">
            <Mail size={13} className="shrink-0" />
            {owner.email}
          </a>
        </div>
      )}

      {canCancel && (
        <div className="flex justify-end">
          <Button variant="danger-outline" size="sm" onClick={() => onCancel(booking.id)} disabled={cancelling}>
            {t('cancel')}
          </Button>
        </div>
      )}
    </div>
  );
}
