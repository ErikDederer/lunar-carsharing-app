export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'DEAD_LETTER';

export interface PayoutBookingCar {
  id: string;
  brand: string;
  model: string;
}

export interface PayoutBookingPayment {
  disputeWindowEndsAt: string | null;
  releasedAt: string | null;
  currency: string;
}

export interface PayoutBooking {
  id: string;
  startAt: string;
  endAt: string;
  car: PayoutBookingCar;
  payment: PayoutBookingPayment | null;
}

// Mirrors TransferRecord + the booking.car/booking.payment the backend
// now includes (see payouts.repository.ts findByOwnerId).
export interface Payout {
  id: string;
  bookingId: string;
  amountOwner: number;
  amountPlatform: number;
  status: PayoutStatus;
  executedAt: string | null;
  createdAt: string;
  booking: PayoutBooking;
}
