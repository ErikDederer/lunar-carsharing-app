import type { useTranslations } from 'next-intl';

// Thrown by the payment/connect/booking services instead of a bare Error,
// so callers can branch on `status`/`code` rather than parsing English text.
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Parses the {statusCode, message, error, code?} body HttpExceptionFilter
// sends on the backend (see p2p-carsharing-api). `code` is only present for
// the handful of exceptions the backend has been taught to tag — everything
// else resolves through the generic fallback in mapErrorToMessage.
export async function parseApiError(res: Response): Promise<ApiError> {
  const data = await res.json().catch(() => ({}) as Record<string, unknown>);
  const message =
    typeof data?.message === 'string' ? data.message : `Request failed: ${res.status}`;
  const code = typeof data?.code === 'string' ? data.code : undefined;
  return new ApiError(res.status, message, code);
}

type Translator = ReturnType<typeof useTranslations>;

// A Stripe.js confirmPayment() error has its own typed `code` (card_declined,
// expired_card, ...) — nothing to do with the backend's ApiError.code. Both
// funnel through here so screens 1 & 2 share one mapping instead of each
// inventing their own fallback text. `fallback` is the caller's already
// -translated generic message (existing `common.error` key) — kept as a
// plain string instead of another namespaced lookup so this doesn't depend
// on a `common.errors.*` shape that doesn't exist in messages/*.json.
export function mapErrorToMessage(err: unknown, tPayments: Translator, fallback: string): string {
  if (err instanceof ApiError && err.code) {
    const key = `errors.${err.code}`;
    return tPayments.has(key) ? tPayments(key) : fallback;
  }

  if (isStripeError(err) && err.code) {
    const key = `errors.stripe.${err.code}`;
    return tPayments.has(key) ? tPayments(key) : fallback;
  }

  return fallback;
}

function isStripeError(err: unknown): err is { type: string; code?: string; message?: string } {
  return typeof err === 'object' && err !== null && 'type' in err;
}
