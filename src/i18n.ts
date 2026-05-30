export type Locale = 'ko' | 'en' | 'ja';

export const locales: Locale[] = ['ko', 'en', 'ja'];

export const localeLabels: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
  ja: 'JA',
};

export function getLocale(pathname: string): Locale {
  if (pathname.startsWith('/en/')) return 'en';
  if (pathname.startsWith('/ja/')) return 'ja';
  return 'ko';
}

export function localizePath(pathname: string, locale: Locale): string {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  let base = normalized;

  if (base.startsWith('/en/')) base = `/${base.slice(4)}`;
  if (base.startsWith('/ja/')) base = `/${base.slice(4)}`;
  if (base.startsWith('/posts/')) base = `/${base.slice(7)}`;

  if (base === '/about/') base = '/profile/';
  if (base === '/profile/' && locale !== 'ko') base = '/about/';
  if (base === '/404/' || base === '/404.html/') return locale === 'ko' ? '/' : `/${locale}/`;

  if (locale === 'ko') return base;
  return `/${locale}${base}`;
}

export const navLabels: Record<Locale, {
  notes: string;
  profile: string;
  portfolio: string;
  workflow: string;
  tags: string;
}> = {
  ko: {
    notes: 'Notes',
    profile: 'Profile',
    portfolio: 'Portfolio',
    workflow: 'AI Workflow',
    tags: 'Tags',
  },
  en: {
    notes: 'Notes',
    profile: 'Profile',
    portfolio: 'Portfolio',
    workflow: 'Workflow',
    tags: 'Tags',
  },
  ja: {
    notes: 'Notes',
    profile: 'Profile',
    portfolio: 'Portfolio',
    workflow: 'AI Workflow',
    tags: 'Tags',
  },
};
