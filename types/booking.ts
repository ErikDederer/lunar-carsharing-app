import type { Car } from './car';
import type { PaymentRecord, DepositRecord } from './payment';

// IN_PROGRESS = car handed over, EXPIRED = not answered / not paid in time
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BookingActor = 'RENTER' | 'OWNER' | 'ADMIN' | 'SYSTEM';

export interface BookedDate {
  startAt: string;
  endAt: string;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS';
}

export interface AvailabilitySlot {
  dateFrom: string;
  dateTo: string;
  periodType: 'available' | 'blocked';
}

export interface BookedDatesResponse {
  bookings: BookedDate[];
  slots: AvailabilitySlot[];
}

export interface CreateBookingDto {
  carId: string;
  startAt: string;
  endAt: string;
  note?: string;
}

export interface BookingRenter {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
}

export interface BookingOwner {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
}

export interface BookingRawCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number | string;
  deposit: number | string;
  address: string;
  photos?: { id: string; carPhotoUrl: string }[];
  owner?: BookingOwner | null;
}

export interface BookingRaw {
  id: string;
  carId: string;
  renterId: string;
  startAt: string;
  endAt: string;
  totalPrice: number | string;
  depositAmount: number | string;
  // Snapshot of the agreed terms, integer cents (source of truth for money)
  currency?: string;
  totalPriceCents?: number;
  depositAmountCents?: number;
  bookingStatus: BookingStatus;
  paymentDueAt?: string | null;
  pickedUpAt?: string | null;
  returnedAt?: string | null;
  cancelledBy?: BookingActor | null;
  createdAt: string;
  updatedAt: string;
  car?: BookingRawCar | Car;
  renter?: BookingRenter;
  // Full records via GET /bookings/:id; status-only summaries in the lists.
  payment?: PaymentRecord | PaymentSummary | null;
  deposit?: DepositRecord | DepositSummary | null;
}

export interface PaymentSummary {
  status: PaymentRecord['status'];
  amountTotal: number;
  currency: string;
}

export interface DepositSummary {
  status: DepositRecord['status'];
  amount: number;
}

export interface Booking {
  id: string;
  carId: string;
  renterId: string;
  startAt: string;
  endAt: string;
  // Integer cents
  totalPriceCents: number;
  depositAmountCents: number;
  currency: string;
  status: BookingStatus;
  paymentDueAt: string | null;
  cancelledBy: BookingActor | null;
  createdAt: string;
  car?: BookingRawCar | Car;
  renter?: BookingRenter;
  payment?: PaymentRecord | PaymentSummary | null;
  deposit?: DepositRecord | DepositSummary | null;
}

export interface BookingStatsCounts {
  pending: number;
  confirmed: number;
  cancelled: number;
}

export interface BookingStats {
  myBookings: BookingStatsCounts;
  incoming: BookingStatsCounts;
}
