"use client";

import { useState, useEffect, useRef } from "react";
import { applyGoogleTranslate } from "@/components/layout/GoogleTranslate";
import { useSession } from "@/lib/auth/session-context";
import { createClient } from "@/server/supabase/client";
import { LOCALE_TO_LANGUAGE } from "@/lib/i18n";

const LANGUAGES = [
  { code: "en",  label: "English",    nativeLabel: "English" },
  { code: "te",  label: "Telugu",     nativeLabel: "తెలుగు" },
  { code: "hi",  label: "Hindi",      nativeLabel: "हिन्दी" },
  { code: "ta",  label: "Tamil",      nativeLabel: "தமிழ்" },
  { code: "kn",  label: "Kannada",    nativeLabel: "ಕನ್ನಡ" },
  { code: "ml",  label: "Malayalam",  nativeLabel: "മലയാളം" },
  { code: "mr",  label: "Marathi",    nativeLabel: "मराठी" },
  { code: "bn",  label: "Bengali",    nativeLabel: "বাংলা" },
  { code: "gu",  label: "Gujarati",   nativeLabel: "ગુજરાતી" },
];

interface LanguageSelectorProps {
  variant?: "navbar" | "dashboard";
}

export function LanguageSelector({ variant = "navbar" }: LanguageSelectorProps) {
  const { user, refresh } = useSession();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentLang, setCurrentLang] = useState("en");
  const [isReady, setIsReady] = useState(false);

  // Restore saved language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("grainline_lang") || "en";
    setCurrentLang(saved);
  }, []);

  // Poll for Google Translate widget initialization
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const selectEl = document.querySelector(".goog-te-combo");
      if (typeof window !== "undefined" && (window as any).google?.translate && selectEl) {
        setIsReady(true);
        clearInterval(checkInterval);
      }
    }, 250);

    return () => clearInterval(checkInterval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    setIsOpen(false);
    
    // Set cookies to keep server/middleware/Google Translate in sync
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000`;
    
    // If logged in, update database in background
    if (user) {
      const languageName = LOCALE_TO_LANGUAGE[langCode as keyof typeof LOCALE_TO_LANGUAGE] || "English";
      // Run update in background safely
      (async () => {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ preferred_language: languageName })
            .eq("id", user.id);
          if (error) throw error;
          await refresh();
        } catch (err) {
          console.error("[LanguageSelector] DB sync failed:", err);
        }
      })();
    }

    if (!isReady && langCode !== "en") {
      // Fallback: set cookies directly and reload if selected before script initialized
      setCurrentLang(langCode);
      localStorage.setItem("grainline_lang", langCode);
      const gtValue = `/en/${langCode}`;
      document.cookie = `googtrans=${gtValue}; path=/`;
      document.cookie = `googtrans=${gtValue}; path=/; domain=${location.hostname}`;
      window.location.reload();
      return;
    }

    setCurrentLang(langCode);
    localStorage.setItem("grainline_lang", langCode);
    applyGoogleTranslate(langCode);
  };

  const selectedLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  if (variant === "dashboard") {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg bg-cream text-ink text-[13px] font-medium hover:bg-paper-2 transition-all focus:outline-none focus:ring-1 focus:ring-paddy"
        >
          <span>🌐 {selectedLang.nativeLabel}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-cream border border-line rounded-lg shadow-soft py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2 text-[13px] hover:bg-paper-2 transition-colors ${
                  currentLang === lang.code ? "text-paddy font-semibold" : "text-ink-soft"
                }`}
              >
                {lang.nativeLabel}
                {lang.code !== "en" && <span className="text-muted text-[11px] ml-1">({lang.label})</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors focus:outline-none"
      >
        <span>🌐 {selectedLang.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-cream border border-line rounded-card shadow-soft py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-[13px] hover:bg-paper-2 transition-colors ${
                currentLang === lang.code ? "text-paddy font-semibold" : "text-ink-soft"
              }`}
            >
              {lang.nativeLabel}
              {lang.code !== "en" && <span className="text-muted text-[11px] ml-1">({lang.label})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
