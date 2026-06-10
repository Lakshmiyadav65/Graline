import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { createClient } from '@/server/supabase/server';
import { getLocaleFromLanguage } from '@/lib/i18n';
import { readFileSync } from 'fs';
import { join } from 'path';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const nextLocaleCookie = cookieStore.get('NEXT_LOCALE')?.value || null;
  
  let resolvedLocale: string | null = null;
  let profileLang: string | null = null;

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
        profileLang = profile.preferred_language;
        resolvedLocale = getLocaleFromLanguage(profileLang);
      }
    }
  } catch (err) {
    // Ignore error if database / session is unavailable in static compilation contexts
  }

  // Fallback hierarchy: 1. Cookie value, 2. Profile language, 3. 'en' final fallback
  const locale = nextLocaleCookie || resolvedLocale || 'en';

  // Read message file directly from filesystem to prevent any bundling/encoding corruption
  let messages = {};
  let keyCount = 0;

  // Helper function to deep merge two objects
  function deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (target && typeof target === 'object' && source && typeof source === 'object') {
      Object.keys(source).forEach(key => {
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

  // Load English messages as the base fallback
  let enMessages = {};
  try {
    const enFilePath = join(process.cwd(), 'messages', 'en.json');
    const enFileContent = readFileSync(enFilePath, 'utf-8');
    enMessages = JSON.parse(enFileContent);
  } catch (err) {
    console.error(`[i18n-verification-error] Failed to read base English translation file: ${err}`);
  }

  if (locale === 'en') {
    messages = enMessages;
    keyCount = Object.keys(messages).length;
  } else {
    try {
      const filePath = join(process.cwd(), 'messages', `${locale}.json`);
      const fileContent = readFileSync(filePath, 'utf-8');
      const localeMessages = JSON.parse(fileContent);
      messages = deepMerge(enMessages, localeMessages);
      keyCount = Object.keys(localeMessages).length;
    } catch (err) {
      console.error(`[i18n-verification-error] Failed to read translation file for ${locale}: ${err}`);
      messages = enMessages; // Fallback to English messages on error
    }
  }

  // Temporarily log verification stats to identify mismatch
  console.log(`[i18n-verification-request] Profile Language: "${profileLang || 'undefined'}", Current Locale Code: "${locale}", Cookie NEXT_LOCALE Value: "${nextLocaleCookie || 'undefined'}", Loaded Translation File: "messages/${locale}.json", Key Count: ${keyCount}`);

  return {
    locale,
    messages
  };
});
