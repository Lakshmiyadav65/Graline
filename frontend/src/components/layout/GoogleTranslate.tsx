"use client";

import { useEffect } from "react";

/**
 * Injects the Google Translate widget into the page.
 * The widget is hidden visually — language switching happens via
 * the LanguageSelector component which triggers the GT cookie directly.
 */
export function GoogleTranslate() {
  useEffect(() => {
    // Restore saved language on page load
    const saved = localStorage.getItem("grainline_lang");
    if (saved && saved !== "en") {
      // Google Translate needs a short delay to initialise
      const timer = setTimeout(() => {
        applyGoogleTranslate(saved);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* Hidden Google Translate element — required by the widget */}
      <div id="google_translate_element" style={{ display: "none" }} />
      {/* Google Translate script */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'te,hi,ta,kn,ml,mr,bn,gu,pa,ur',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
          `,
        }}
      />
      {/* Load Google Translate API */}
      <script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        async
      />
    </>
  );
}

/**
 * Programmatically switch Google Translate to the given language code.
 * Called by LanguageSelector when user picks a language.
 */
export function applyGoogleTranslate(langCode: string) {
  if (langCode === "en") {
    // Reset to English — remove GT cookie and reload
    const gtCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("googtrans="));
    if (gtCookie) {
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "googtrans=; path=/; domain=" + location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    // Remove GT frame if shown
    const iframe = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement | null;
    if (iframe) iframe.style.display = "none";
    document.body.style.top = "";
    return;
  }

  // Set GT cookie to trigger translation
  const gtValue = `/en/${langCode}`;
  document.cookie = `googtrans=${gtValue}; path=/`;
  document.cookie = `googtrans=${gtValue}; path=/; domain=${location.hostname}`;

  // Try to use the GT select element (most reliable approach)
  try {
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event("change"));
      return;
    }
  } catch {
    // fallback
  }

  // Reload so GT cookie takes effect
  window.location.reload();
}
