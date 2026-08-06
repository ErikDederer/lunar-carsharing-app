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

export type DepositStatus = 'AUTHORIZED' | 'CAPTURED' | 'RELEASED' | 'EXPIRED' | 'CHARGED' | 'REFUNDED';

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
  deposit: {
    depositId: string;
    clientSecret: string;
    amount: number;
    holdStrategy: 'AUTH_HOLD' | 'CHARGE_AND_REFUND';
  } | null;
}

// Local, UI-only state machine for the checkout screen — not a mirror of
// PaymentStatus, which describes the money's lifecycle server-side.
export type CheckoutUiState = 'idle' | 'submitting' | 'requires_action' | 'succeeded' | 'failed';
