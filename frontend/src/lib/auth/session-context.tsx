"use client";

import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from "react";
import { createClient } from "@/server/supabase/client";
import { getLocaleFromLanguage } from "@/lib/i18n";
import { applyGoogleTranslate } from "@/components/layout/GoogleTranslate";

export type Role = "customer" | "farmer" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  role: Role;
  preferred_language?: string | null;
}

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number, role, preferred_language')
        .eq('id', session.user.id)
        .single();
        
      const prefLang = profile?.preferred_language || null;
      setUser({
        id: session.user.id,
        name: profile?.full_name || "User",
        phone: profile?.phone_number || "",
        role: (profile?.role as Role) || (session.user.user_metadata?.role as Role) || "customer",
        preferred_language: prefLang
      });

      if (prefLang) {
        const localeCode = getLocaleFromLanguage(prefLang);
        
        // Sync NEXT_LOCALE cookie to keep server/middleware in alignment
        const currentCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("NEXT_LOCALE="))
          ?.split("=")[1];
        if (currentCookie !== localeCode) {
          document.cookie = `NEXT_LOCALE=${localeCode}; path=/; max-age=31536000`;
        }

        // Sync with Google Translate state without causing hard page-reload loops
        const currentSaved = localStorage.getItem("grainline_lang") || "en";
        if (currentSaved !== localeCode) {
          localStorage.setItem("grainline_lang", localeCode);
          const gtValue = `/en/${localeCode}`;
          document.cookie = `googtrans=${gtValue}; path=/`;
          document.cookie = `googtrans=${gtValue}; path=/; domain=${location.hostname}`;
          applyGoogleTranslate(localeCode);
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void refresh();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [refresh, supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
