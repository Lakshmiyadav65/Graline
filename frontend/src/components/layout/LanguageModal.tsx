"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/session-context";
import { createClient } from "@/server/supabase/client";
import { LOCALE_TO_LANGUAGE } from "@/lib/i18n";

const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
];

export function LanguageModal() {
  const { user, refresh } = useSession();
  const [show, setShow] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState("en");
  const supabase = createClient();

  useEffect(() => {
    // Check if user has already chosen language in this browser
    const chosen = localStorage.getItem("grainline_lang_chosen");
    if (!chosen) {
      // Get current locale cookie if any, default to "en"
      const cookieLocale = document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="))
        ?.split("=")[1] || "en";
      setSelectedLocale(cookieLocale);
      setShow(true);
    }
  }, []);

  const handleSave = async (localeCode: string, isSkip = false) => {
    document.cookie = `NEXT_LOCALE=${localeCode}; path=/; max-age=31536000`;
    localStorage.setItem("grainline_lang", localeCode);
    localStorage.setItem("grainline_lang_chosen", "true");
    
    if (user && !isSkip) {
      const languageName = LOCALE_TO_LANGUAGE[localeCode as keyof typeof LOCALE_TO_LANGUAGE] || "English";
      await supabase
        .from("profiles")
        .update({ preferred_language: languageName })
        .eq("id", user.id);
      await refresh();
    }
    
    setShow(false);
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-cream border border-line rounded-card-lg shadow-depth max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="font-serif text-[24px] text-ink leading-tight mb-2 text-center">
          Choose Your Language
        </h2>
        <p className="text-[13px] text-ink-soft text-center mb-6">
          Select your preferred language to customize your Grainline experience.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelectedLocale(lang.code)}
              className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                selectedLocale === lang.code
                  ? "border-paddy bg-paddy/5 text-ink font-semibold"
                  : "border-line bg-paper text-ink-soft hover:bg-paper-2"
              }`}
            >
              <span className="text-[15px]">{lang.nativeLabel}</span>
              <span className="text-[11px] text-muted">{lang.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleSave(selectedLocale, false)}
            className="w-full py-2.5 bg-ink text-paper rounded-full text-[14px] font-medium hover:bg-paddy hover:shadow-soft transition-all"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => handleSave("en", true)}
            className="w-full py-2 text-ink-soft rounded-full text-[13px] hover:text-ink transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
