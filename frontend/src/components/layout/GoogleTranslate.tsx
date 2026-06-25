"use client";

import { useEffect } from "react";

/**
 * Injects the Google Translate widget callback and handles setup.
 * Restores cookies on mount without forcing loops.
 */
export function GoogleTranslate() {
  useEffect(() => {
    // 1. Restore saved language cookie safely on mount
    const saved = localStorage.getItem("grainline_lang");
    if (saved && saved !== "en") {
      const gtValue = `/en/${saved}`;
      
      // Setup cookies
      document.cookie = `googtrans=${gtValue}; path=/;`;
      document.cookie = `googtrans=${gtValue}; path=/; domain=${location.hostname};`;
      
      // Try to select in combobox without forcing reload loops
      const timer = setTimeout(() => {
        try {
          const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
          if (selectEl && selectEl.value !== saved) {
            selectEl.value = saved;
            selectEl.dispatchEvent(new Event("change"));
          }
        } catch (e) {
          console.error('[Google Translate] Pre-fill failed:', e);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 2. Set up MutationObserver to detect translation completions
    const observer = new MutationObserver(() => {
      const isTranslated = document.documentElement.classList.contains("translated-ltr") || 
                           document.documentElement.classList.contains("translated-rtl");
      const currentSaved = localStorage.getItem("grainline_lang") || "en";
      
      if (isTranslated || currentSaved === "en") {
        window.dispatchEvent(new CustomEvent("translationEnd"));
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hidden Google Translate element — required by the widget */}
      <div id="google_translate_element" style={{ display: "none" }} />
      {/* Google Translate callback setup (Guarded against duplication) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (!window.googleTranslateElementInit) {
              window.googleTranslateElementInit = function() {
                if (window.googleTranslateInitComplete) return;
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'te,hi,ta,kn,ml,mr,bn,gu,pa,ur',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element');
                window.googleTranslateInitComplete = true;
              };
            }
          `,
        }}
      />
      {/* Load Google Translate API (uses async to not block) */}
      <script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        async
      />
    </>
  );
}

/**
 * Programmatically switch Google Translate to the given language code.
 * Dispatches start/end events for loader animation.
 */
export function applyGoogleTranslate(langCode: string) {
  window.dispatchEvent(new CustomEvent("translationStart"));

  // Fallback to end translation loader after 1.5s in case widget fails
  const fallbackTimer = setTimeout(() => {
    window.dispatchEvent(new CustomEvent("translationEnd"));
  }, 1500);

  // Clear fallback timer if translationEnd is dispatched early
  const clearFallback = () => clearTimeout(fallbackTimer);
  window.addEventListener("translationEnd", clearFallback, { once: true });

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
    
    // Select English or empty in combobox
    try {
      const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (selectEl) {
        selectEl.value = "";
        selectEl.dispatchEvent(new Event("change"));
        // Dispatch translationEnd since we processed the combobox change
        window.dispatchEvent(new CustomEvent("translationEnd"));
        return;
      }
    } catch {
      // fallback to reload
    }
    
    window.location.reload();
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
  } catch (err) {
    console.error('[Google Translate] Interactive change failed:', err);
  }

  // Reload only if selector was not found on user action
  window.location.reload();
}
