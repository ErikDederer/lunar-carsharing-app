export type PaymentStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'HELD'
  | 'ON_HOLD'
  | 'RELEASING'
  | 'TRANSFERRED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'CANCELED'
  | 'FAILED';

export type DepositStatus =
  | 'PENDING'
  | 'FAILED'
  | 'AUTHORIZED'
  | 'CHARGED'
  | 'CAPTURED'
  | 'RELEASED'
  | 'REFUNDED'
  | 'EXPIRED'
  | 'CANCELED';

// Payment states in which the rental is paid (mirrors the backend).
export const PAID_STATUSES: PaymentStatus[] = [
  'HELD',
  'ON_HOLD',
  'RELEASING',
  'TRANSFERRED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

// Deposit states in which the renter has secured the deposit.
export const DEPOSIT_SECURED: DepositStatus[] = ['AUTHORIZED', 'CHARGED'];

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amountTotal: number;
  platformFeeAmount: number;
  ownerAmount: number;
  currency: string;
  status: PaymentStatus;
  disputeWindowEndsAt: string | null;
  releasedAt: string | null;
}

export interface DepositRecord {
  id: string;
  bookingId: string;
  amount: number;
  status: DepositStatus;
  capturedAmount: number | null;
  releasedAt: string | null;
}

// Response of POST /payments/checkout: payment always exists once the
// booking is confirmed; deposit is null when the car has no deposit.
export interface CheckoutResponse {
  payment: {
    paymentId: string;
    clientSecret: string;
    amountTotal: number;
    currency: string;
  };
  deposit: DepositView | null;
}

// Response of POST /payments/deposit (and `deposit` in checkout).
// SCHEDULED = too early to place the hold — call again after opensAt.
// clientSecret is only set while the renter has to confirm a card.
export interface DepositView {
  depositId: string | null;
  status: DepositStatus | 'SCHEDULED';
  clientSecret: string | null;
  amount: number;
  currency: string;
  holdStrategy: 'AUTH_HOLD' | 'CHARGE_AND_REFUND' | null;
  opensAt: string | null;
  authorizationExpiresAt: string | null;
}

// Local, UI-only state machine for the checkout screen — not a mirror of
// PaymentStatus, which describes the money's lifecycle server-side.
export type CheckoutUiState = 'idle' | 'submitting' | 'requires_action' | 'succeeded' | 'failed';
