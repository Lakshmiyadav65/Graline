import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Lazily create the browser Supabase client on first use.
//
// Creating it at module-load time throws ("Your project's URL and API key are
// required...") whenever the env vars are missing — which crashes `next build`
// as soon as a route module is imported, even for force-dynamic pages. Deferring
// instantiation keeps imports side-effect free, so the build only needs the env
// vars at request time, where a missing one fails loudly at the actual call site.

let client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
      );
    }

    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

// Proxy preserves the existing `import { supabase } from "@/lib/supabase"` surface
// while routing every property access through the lazy getter.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient(), prop, receiver);
    return typeof value === 'function' ? value.bind(getClient()) : value;
  },
});
