<<<<<<< HEAD
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { createClient } from '@/server/supabase/server';
import { getLocaleFromLanguage } from '@/lib/i18n';
import enMessages from '../../messages/en.json';

// Statically wire up locale loaders so the bundler includes the JSON files in the
// serverless function. (Previously these were read with readFileSync at runtime,
// which works locally but is NOT traced into the Vercel build — the files were
// missing in production, so every key rendered as its raw name e.g. "home.title".)
const LOCALE_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {
  en: async () => enMessages,
  hi: async () => (await import('../../messages/hi.json')).default,
  kn: async () => (await import('../../messages/kn.json')).default,
  ta: async () => (await import('../../messages/ta.json')).default,
  te: async () => (await import('../../messages/te.json')).default,
};

// Helper function to deep merge two objects (locale on top of English fallback).
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (target && typeof target === 'object' && source && typeof source === 'object') {
    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === 'object') {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const nextLocaleCookie = cookieStore.get('NEXT_LOCALE')?.value || null;

  let resolvedLocale: string | null = null;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();

      if (profile?.preferred_language) {
        resolvedLocale = getLocaleFromLanguage(profile.preferred_language);
      }
    }
  } catch (err) {
    // Ignore error if database / session is unavailable in static compilation contexts
  }

  // Fallback hierarchy: 1. Cookie value, 2. Profile language, 3. 'en' final fallback
  const requested = nextLocaleCookie || resolvedLocale || 'en';
  const locale = LOCALE_LOADERS[requested] ? requested : 'en';

  let messages: Record<string, unknown> = enMessages;
  if (locale !== 'en') {
    try {
      const localeMessages = await LOCALE_LOADERS[locale]();
      messages = deepMerge(enMessages, localeMessages);
    } catch (err) {
      console.error(`[i18n] Failed to load translation file for "${locale}", falling back to English: ${err}`);
      messages = enMessages;
    }
  }

  return {
    locale,
    messages,
  };
});
=======
/**
 * i18n/request.ts — Legacy stub.
 *
 * next-intl has been replaced by Google Translate (GoogleTranslate component)
 * + a direct JSON translation shim (@/lib/translations).
 * This file is kept to avoid import errors from any residual references,
 * but is no longer wired into next.config.mjs.
 */
export {};
