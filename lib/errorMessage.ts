import type { useTranslations } from 'next-intl';
import { ApiError } from './apiError';

type Translator = ReturnType<typeof useTranslations>;

// Maps a backend error to a translated message by its machine-readable
// `code` (messages: "errors.<CODE>"), never by the English `message`.
export function errorMessage(err: unknown, tErrors: Translator, fallback: string): string {
  if (err instanceof ApiError && err.code && tErrors.has(err.code)) {
    return tErrors(err.code);
  }
  return fallback;
}
