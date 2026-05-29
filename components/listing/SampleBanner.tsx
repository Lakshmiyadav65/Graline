"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";

/**
 * ₹50 sample CTA. In FE-M3 this kicks off the mock sample request; the full
 * address + Razorpay flow is layered on in FE-M4.
 */
export function SampleBanner({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function requestSample() {
    setLoading(true);
    const res = await api.samples.create({
      listing_id: listingId,
      address: { label: "Home", line1: "—", city: "Hyderabad", pincode: "500001" },
    });
    setLoading(false);
    if (!res.ok) {
      toast.show(res.error.message, "error");
      return;
    }
    toast.show("Sample requested — ₹50, refunded against your first 10kg order.", "success");
  }

  return (
    <div className="mt-[18px] px-4 py-3.5 bg-paper-2 border border-dashed border-terra rounded-card text-[13px] text-ink-soft flex justify-between items-center gap-3.5">
      <div>
        Not sure? Get a <strong className="text-terra">250g sample for ₹50</strong> — refunded
        against your first 10kg order.
      </div>
      <button
        type="button"
        onClick={requestSample}
        disabled={loading}
        className="shrink-0 bg-terra text-white border-none px-3.5 py-2 rounded-[4px] text-[12px] font-semibold uppercase tracking-[0.05em] cursor-pointer hover:bg-terra-2 transition-colors disabled:opacity-60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {loading ? "…" : "Send sample"}
      </button>
    </div>
  );
}
