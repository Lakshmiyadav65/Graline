"use client";

import { formatRupees } from "@/lib/format";

interface RazorpayMockProps {
  amountPaise: number;
  onSuccess: () => void;
  onFailure: () => void;
  onDismiss: () => void;
}

/**
 * Stand-in for the Razorpay checkout widget. Lets us exercise all three
 * return paths (success / failure / dismissed) against the mock. The real
 * Razorpay SDK replaces this at INTEGRATION.
 */
export function RazorpayMock({ amountPaise, onSuccess, onFailure, onDismiss }: RazorpayMockProps) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-ink/50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
      onClick={onDismiss}
    >
      <div
        className="bg-paper rounded-card-lg shadow-soft w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[12px] tracking-[0.15em] uppercase text-muted">
            Razorpay · test mode
          </span>
          <button type="button" aria-label="Close" onClick={onDismiss} className="text-muted hover:text-ink text-[18px] leading-none">
            ×
          </button>
        </div>
        <div className="font-serif text-[36px] font-semibold leading-none mb-1">
          {formatRupees(amountPaise)}
        </div>
        <p className="text-[13px] text-muted mb-6">Mock payment — pick an outcome to test the flow.</p>
        <button
          type="button"
          onClick={onSuccess}
          className="w-full py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] tracking-[0.04em] uppercase hover:bg-paddy-2 transition-colors mb-2"
        >
          Pay {formatRupees(amountPaise)} →
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onFailure}
            className="flex-1 py-2.5 border border-line rounded-card text-[13px] text-ink-soft hover:border-terra hover:text-terra transition-colors"
          >
            Simulate failure
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 py-2.5 border border-line rounded-card text-[13px] text-ink-soft hover:border-ink hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
