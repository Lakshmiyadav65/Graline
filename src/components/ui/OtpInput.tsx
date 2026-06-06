"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Auto-advancing, paste-friendly OTP entry. `length` boxes, numeric only.
 * 44px-tall boxes — comfortable mobile tap targets.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = (value + "·".repeat(length)).slice(0, length).replace(/·/g, " ").split("");

  function setChar(i: number, c: string) {
    const arr = value.padEnd(length, " ").slice(0, length).split("");
    arr[i] = c || " ";
    onChange(arr.join("").replace(/ /g, ""));
  }

  function handleChange(i: number, raw: string) {
    const c = raw.replace(/\D/g, "").slice(-1);
    setChar(i, c);
    if (c && i < length - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !chars[i].trim() && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (digits) {
      onChange(digits);
      refs.current[Math.min(digits.length, length - 1)]?.focus();
    }
  }

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={chars[i].trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`OTP digit ${i + 1}`}
          className="w-11 h-14 text-center font-mono text-[20px] border border-line rounded-card bg-paper text-ink focus:outline-none focus:border-ink disabled:opacity-50"
        />
      ))}
    </div>
  );
}
