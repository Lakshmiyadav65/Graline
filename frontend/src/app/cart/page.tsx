"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CartLine } from "@/components/cart/CartLine";
import { useCart, cartSubtotalPaise, cartRetailPaise, cartCount } from "@/lib/cart";
import { useSession } from "@/lib/auth/session-context";
import { formatRupees, formatDate, getNextSaturday } from "@/lib/format";
import { useTranslations } from "@/lib/translations";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const { user } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const t = useTranslations("cart");

  if (!mounted) {
    return (
      <PageShell>
        <div className="py-24 text-center text-muted text-[14px]">{t("loading")}</div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <section className="py-16 max-w-xl">
          <Eyebrow>{t("eyebrow", { count: 0 })}</Eyebrow>
          <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal mt-4 mb-3">
            {t.rich("empty", {
              emEmpty: (chunks) => <em className="text-terra font-medium">{chunks}</em>
            })}
          </h1>
          <p className="text-ink-soft text-[16px] mb-8">
            {t("emptySub")}
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all"
          >
            {t("keepBrowsing")}
          </Link>
        </section>
      </PageShell>
    );
  }

  const subtotal = cartSubtotalPaise(items);
  const retail = cartRetailPaise(items);
  const saving = retail - subtotal;

  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>{t("eyebrow", { count: cartCount(items) })}</Eyebrow>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal mt-3.5 mb-8">
          {t.rich("title", {
            emHome: (chunks) => <em className="text-terra font-medium">{chunks}</em>
          })}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          <div className="bg-cream border border-line rounded-card-lg p-5 sm:p-6">
            {items.map((item) => (
              <CartLine key={`${item.listingId}-${item.packKg}`} item={item} />
            ))}
          </div>

          <div className="bg-cream border border-line rounded-card-lg p-6 h-fit">
            <h3 className="font-serif text-[22px] font-medium mb-4">{t("summary")}</h3>
            <Row label={t("subtotal")} value={formatRupees(subtotal)} />
            {saving > 0 && (
              <Row label={t("directSaving")} value={`−${formatRupees(saving)}`} tone="paddy" />
            )}
            <p className="text-[12px] text-muted mt-3 mb-4">
              {t("checkoutMsg", { date: formatDate(getNextSaturday()) })}
            </p>
            <button
              type="button"
              onClick={() => router.push(user ? "/checkout" : "/login?next=/checkout")}
              className="w-full py-4 bg-paddy text-cream rounded-card font-semibold text-[14px] tracking-[0.05em] uppercase hover:bg-paddy-2 transition-colors"
            >
              {t("proceed")}
            </button>
            <Link href="/browse" className="block text-center text-[13px] text-ink-soft hover:text-ink mt-4">
              {t("keepBrowsingBack")}
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "paddy" }) {
  return (
    <div className="flex justify-between py-1.5 text-[14px]">
      <span className={tone === "paddy" ? "text-paddy font-medium" : "text-ink-soft"}>{label}</span>
      <span className={tone === "paddy" ? "text-paddy font-semibold font-mono" : "font-mono"}>{value}</span>
    </div>
  );
}
