/**
 * translations.ts
 *
 * Drop-in shim replacing next-intl with direct English JSON lookups.
 * Google Translate handles runtime language switching at the DOM level.
 * This module provides the same API as next-intl so all existing call sites
 * work without modification.
 *
 * Usage (server components):
 *   import { getTranslations } from "@/lib/translations";
 *   const t = await getTranslations("home");
 *
 * Usage (client components):
 *   import { useTranslations } from "@/lib/translations";
 *   const t = useTranslations("navigation");
 */

import React from "react";
import en from "../../messages/en.json";

type AnyRecord = Record<string, any>;

// ─── Nested key lookup ────────────────────────────────────────────────────────
function getNestedValue(obj: AnyRecord, key: string): string {
  const parts = key.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return key;
    current = current[part];
  }
  if (current == null || typeof current === "object") return key;
  return String(current);
}

// ─── ICU-lite param substitution (no plural support needed for English) ───────
function interpolate(raw: string, params?: AnyRecord): string {
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}

// ─── t.rich — parse tagged template strings like "Hello <em>world</em>" ──────
// Works for both client (returns React nodes) and server (returns string).
function richParse(raw: string, components: AnyRecord): any {
  // Split on XML-like tags: <tagName>...</tagName> or <tagName />
  const parts: any[] = [];
  const tagRegex = /<(\w+)\s*\/>|<(\w+)>(.*?)<\/\2>/gs;
  let last = 0;
  let match;

  while ((match = tagRegex.exec(raw)) !== null) {
    // Text before this tag
    if (match.index > last) {
      parts.push(raw.slice(last, match.index));
    }
    const selfClosing = match[1];
    const tagName = selfClosing ?? match[2];
    const inner = match[3] ?? "";
    const factory = components[tagName];
    if (typeof factory === "function") {
      parts.push(factory(inner || undefined));
    } else {
      parts.push(inner);
    }
    last = match.index + match[0].length;
  }
  // Trailing text
  if (last < raw.length) {
    parts.push(raw.slice(last));
  }

  return React.createElement(React.Fragment, null, ...parts);
}

// ─── Translation function factory ─────────────────────────────────────────────
type RichComponents = Record<string, (chunks: React.ReactNode) => React.ReactNode>;

interface TranslationFn {
  (key: string, params?: AnyRecord): string;
  rich(key: string, components?: RichComponents): React.ReactNode;
}

// ─── Translation function factory ─────────────────────────────────────────────
function createT(ns: string): TranslationFn {
  const section = (en as AnyRecord)[ns] ?? {};

  const t: any = function (key: string, params?: AnyRecord): string {
    const raw = getNestedValue(section, key);
    return interpolate(raw, params);
  };

  t.rich = (key: string, components?: RichComponents): React.ReactNode => {
    const raw = getNestedValue(section, key);
    if (!components) return raw;
    return richParse(raw, components);
  };

  return t as TranslationFn;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Server-side: async getTranslations (matches next-intl's API) */
export async function getTranslations(ns: string): Promise<TranslationFn> {
  return createT(ns);
}

/** Client-side: synchronous useTranslations (matches next-intl's hook API) */
export function useTranslations(ns: string): TranslationFn {
  return createT(ns);
}

/** Locale shim — always "en" since Google Translate handles the display language */
export function useLocale(): string {
  if (typeof window === "undefined") return "en";
  return (typeof localStorage !== "undefined" && localStorage.getItem("grainline_lang")) || "en";
}
