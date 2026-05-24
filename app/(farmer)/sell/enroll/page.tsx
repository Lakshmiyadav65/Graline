import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enroll your farm — Grainline",
};

/**
 * /sell/enroll placeholder. The real 5-step OTP-gated form ships in M5
 * (phone OTP, photo upload, village picker, UPI/Aadhaar, first listing).
 * Until then this page exists so the "Enroll your farm" CTA on /sell resolves.
 */
export default function EnrollPage() {
  return (
    <PageShell>
      <section className="py-16 max-w-2xl mx-auto">
        <Eyebrow>For Farmers · Step 1 of 5</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-4 mb-4"
          style={{ fontSize: "clamp(36px, 5vw, 54px)" }}
        >
          Enrollment <em className="text-terra font-medium">opens here</em>.
        </h1>
        <p className="text-[16px] leading-[1.6] text-ink-soft mb-8">
          The full 5-step form (phone OTP → about your farm → bank details →
          first listing → review) is being built. Until it ships, our team will
          help you enroll directly over WhatsApp — we&apos;ll come to your
          village.
        </p>

        <div className="bg-cream border border-dashed border-terra rounded-card-lg p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div>
            <div className="font-serif text-[18px] font-medium">
              Talk to a Grainline rep
            </div>
            <div className="text-[13px] text-ink-soft mt-1">
              We respond within a day. Conversation is in Telugu, Hindi, or
              English.
            </div>
          </div>
          <a
            href="https://wa.me/919999999999?text=I%20want%20to%20enroll%20my%20farm%20on%20Grainline"
            className="inline-flex items-center gap-2 px-5 py-3 bg-terra text-white rounded-full text-[13px] font-semibold tracking-[0.04em] uppercase hover:bg-terra-2 transition-all whitespace-nowrap focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            WhatsApp now
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-line">
          <h2 className="font-serif text-[20px] font-medium mb-4">
            What you&apos;ll need when the form ships
          </h2>
          <ul className="space-y-3 text-[14px] text-ink-soft">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="font-serif text-gold font-semibold mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-ink rounded-full text-[13px] font-medium hover:bg-ink hover:text-paper transition-all"
          >
            ← Back to Sell on Grainline
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

const CHECKLIST = [
  "A mobile number that receives WhatsApp (for OTP and order pings)",
  "Your village name + district",
  "Land area in acres (rough is fine)",
  "Which rice varieties you grow this season",
  "A UPI ID for payouts (e.g. yourname@upi)",
  "Last 4 digits of your Aadhaar (for verification)",
  "One photo of your farm or the rice (optional but helps customers trust)",
];
