import type { BadgeVariant } from '@/components/atoms/Badge';
import type { Booking, BookingStatus } from '@/types/booking';
import { DEPOSIT_SECURED, PAID_STATUSES } from '@/types/payment';

export const BOOKING_BADGE: Record<BookingStatus, BadgeVariant> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'cancelled',
};

// "Active" from the user's point of view: still running or upcoming.
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];
export const ENDED_BOOKING_STATUSES: BookingStatus[] = ['CANCELLED', 'EXPIRED'];

export function isPaid(booking: Booking): boolean {
  return !!booking.payment && PAID_STATUSES.includes(booking.payment.status);
}

// A booking without a deposit counts as secured.
export function isDepositSecured(booking: Booking): boolean {
  if (booking.depositAmountCents <= 0) return true;
  return !!booking.deposit && DEPOSIT_SECURED.includes(booking.deposit.status);
}

export function hasStarted(booking: Booking, now = Date.now()): boolean {
  return new Date(booking.startAt).getTime() <= now;
}
