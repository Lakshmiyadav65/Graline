"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TranslationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Listen to Google Translate custom events
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleEnd = () => setLoading(false);

    window.addEventListener("translationStart", handleStart);
    window.addEventListener("translationEnd", handleEnd);

    return () => {
      window.removeEventListener("translationStart", handleStart);
      window.removeEventListener("translationEnd", handleEnd);
    };
  }, []);

  // Listen to page navigation
  useEffect(() => {
    const currentSaved = localStorage.getItem("grainline_lang") || "en";
    if (currentSaved !== "en") {
      // Force a hard reload on navigation to avoid React hydration conflicts,
      // partial translations, and browser page freezes.
      window.location.reload();
    }
  }, [pathname]);

  // Prevent infinite buffering: if loading is true, enforce a maximum timeout of 2 seconds
  useEffect(() => {
    if (loading) {
      const maxTimer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(maxTimer);
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-terra z-[99999] overflow-hidden animate-pulse">
      <div className="h-full bg-paddy animate-progress-loading w-1/3 rounded-full" />
    </div>
  );
}
