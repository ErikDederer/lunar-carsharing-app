import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/apiError';
import type { Booking, BookingRaw, BookingStats, CreateBookingDto } from '@/types/booking';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) throw await parseApiError(res);
  return res.json() as Promise<T>;
}

function normalize(raw: BookingRaw): Booking {
  return {
    id: raw.id,
    carId: raw.carId,
    renterId: raw.renterId,
    startAt: raw.startAt,
    endAt: raw.endAt,
    // Older rows may predate the cents snapshot — fall back to the Decimal.
    totalPriceCents: raw.totalPriceCents ?? Math.round(Number(raw.totalPrice) * 100),
    depositAmountCents: raw.depositAmountCents ?? Math.round(Number(raw.depositAmount) * 100),
    currency: raw.currency ?? 'eur',
    status: raw.bookingStatus,
    paymentDueAt: raw.paymentDueAt ?? null,
    cancelledBy: raw.cancelledBy ?? null,
    createdAt: raw.createdAt,
    car: raw.car,
    renter: raw.renter,
    payment: raw.payment,
    deposit: raw.deposit,
  };
}

export const bookingService = {
  create: (dto: CreateBookingDto): Promise<Booking> =>
    request<BookingRaw>('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }).then(normalize),

  getById: (id: string): Promise<Booking> =>
    request<BookingRaw>(`/bookings/${id}`).then(normalize),

  getMy: (): Promise<Booking[]> =>
    request<BookingRaw[]>('/bookings/my').then((list) => list.map(normalize)),

  getIncoming: (): Promise<Booking[]> =>
    request<BookingRaw[]>('/bookings/incoming').then((list) => list.map(normalize)),

  getStats: (): Promise<BookingStats> =>
    request<BookingStats>('/bookings/stats'),

  confirm: (id: string): Promise<Booking> =>
    request<BookingRaw>(`/bookings/${id}/confirm`, { method: 'PATCH' }).then(normalize),

  cancel: (id: string): Promise<Booking> =>
    request<BookingRaw>(`/bookings/${id}/cancel`, { method: 'PATCH' }).then(normalize),

  // Owner hands the car over: CONFIRMED (paid, deposit secured) -> IN_PROGRESS
  pickup: (id: string): Promise<Booking> =>
    request<BookingRaw>(`/bookings/${id}/pickup`, { method: 'PATCH' }).then(normalize),

  complete: (id: string): Promise<Booking> =>
    request<BookingRaw>(`/bookings/${id}/complete`, { method: 'PATCH' }).then(normalize),
};
