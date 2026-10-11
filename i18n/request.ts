import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const SUPPORTED_LOCALES = ['de', 'en', 'ru'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'de';

function isSupported(value: string | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// "ru-RU,ru;q=0.9,en-US;q=0.8" -> first supported language by preference
function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q.split('=')[1]) : 1 };
    })
    .filter((entry) => entry.lang && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);
  return ranked.find((entry) => isSupported(entry.lang))?.lang as Locale | undefined;
}

// An explicit choice (language switcher cookie) wins; otherwise the
// browser's language; otherwise German.
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get('locale')?.value;
  const locale = isSupported(cookieLocale)
    ? cookieLocale
    : (fromAcceptLanguage((await headers()).get('accept-language')) ?? DEFAULT_LOCALE);

  return {
    locale,
    timeZone: 'Europe/Berlin',
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
