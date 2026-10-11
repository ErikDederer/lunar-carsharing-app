// Every money amount from the API is an integer in minor currency units
// (cents) — never derive or round a display value on the frontend, only
// format what the backend already computed.
export function formatMoney(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountMinorUnits / 100);
}
