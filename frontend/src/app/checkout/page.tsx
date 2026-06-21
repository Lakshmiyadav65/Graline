"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ShipOpt } from "@/components/cart/ShipOpt";
import { RequireRole } from "@/components/auth/RequireRole";
import { useToast } from "@/components/ui/Toast";
import { useCart, cartSubtotalPaise, cartRetailPaise } from "@/lib/cart";
import { api } from "@/lib/api/client";
import { addressSchema } from "@/lib/schemas/common";
import { deliveryFeePaise, codFeePaise, commissionPaise } from "@/lib/pricing";
import { formatRupees, formatDate, getNextSaturday } from "@/lib/format";
import type { FulfillmentType, Address } from "@/lib/api/types";
import { useTranslations } from "next-intl";

function CheckoutInner() {
  const router = useRouter();
  const toast = useToast();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);

  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tLabels = useTranslations("labels");

  const [fulfillment, setFulfillment] = useState<FulfillmentType>("home_delivery");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prefill from saved profile address
  useEffect(() => {
    api.customer.profile().then((res) => {
      if (res.ok && res.data.addresses && res.data.addresses[res.data.default_address_idx]) {
        const a = res.data.addresses[res.data.default_address_idx];
        setLine1(a.line1); 
        setLine2(a.line2 ?? ""); 
        setCity(a.city); 
        setPincode(a.pincode);
      }
      if (res.ok && res.data.phone) {
        setPhone(res.data.phone.replace("+91", ""));
      }
    });
  }, []);

  const subtotal = useMemo(() => cartSubtotalPaise(items), [items]);
  const retail = useMemo(() => cartRetailPaise(items), [items]);
  const deliveryFee = deliveryFeePaise(fulfillment, subtotal);
  const cod = codFeePaise("cod");
  const total = subtotal + deliveryFee + cod;
  const farmerReceives = subtotal - commissionPaise(subtotal);
  const directSaving = retail - subtotal;
  const needsAddress = fulfillment !== "farm_pickup";

  if (mounted && items.length === 0) {
    return (
      <PageShell>
        <section className="py-20 text-center max-w-md mx-auto">
          <h1 className="font-serif text-[32px] mb-3">{t("nothingTitle")}</h1>
          <p className="text-muted mb-6">{t("nothingSub")}</p>
          <Link href="/browse" className="inline-flex px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all">{t("browseRiceBtn")}</Link>
        </section>
      </PageShell>
    );
  }

  function buildAddress(): Address | null {
    if (!needsAddress) return undefined as unknown as null;
    const candidate = { label: "Home", line1, line2: line2 || undefined, city, pincode };
    const parsed = addressSchema.safeParse(candidate);
    if (!parsed.success) {
      toast.show(t("addressWarning"), "error");
      return null;
    }
    return parsed.data;
  }

  async function placeOrder() {
    const address = needsAddress ? buildAddress() : undefined;
    if (needsAddress && !address) return;
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.show(t("phoneWarning"), "error");
      return;
    }

    setSubmitting(true);
    const res = await api.orders.create({
      items: items.map((i) => ({ listing_id: i.listingId, pack_kg: i.packKg, qty: i.qty })),
      fulfillment_type: fulfillment,
      delivery_address: address ?? undefined,
      phone: `+91${phone}`,
      payment_method: "cod",
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.show(res.error.message, "error");
      return;
    }

    clear();
    toast.show(t("orderPlacedSuccess"), "success");
    router.push(`/orders/${res.data.orderNumber}`);
  }

  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal mt-3.5 mb-8">
          {t.rich("title", {
            emHome: (chunks) => <em className="text-terra font-medium">{chunks}</em>
          })}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* LEFT: delivery + payment */}
          <div className="space-y-5">
            <div className="bg-cream border border-line rounded-card-lg p-6">
              <h3 className="font-serif text-[22px] font-medium mb-4">{t("delivery")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                <ShipOpt title={t("farmPickup")} detail={t("farmPickupDetail")} fee={t("free")} selected={fulfillment === "farm_pickup"} onSelect={() => setFulfillment("farm_pickup")} />
                <ShipOpt title={t("cityPickup")} detail={t("cityPickupDetail")} fee={formatRupees(5000)} selected={fulfillment === "city_pickup_point"} onSelect={() => setFulfillment("city_pickup_point")} />
                <ShipOpt title={t("homeDelivery")} detail={t("homeDeliveryDetail")} fee={subtotal >= 200000 ? t("freeOver") : formatRupees(12000)} selected={fulfillment === "home_delivery"} onSelect={() => setFulfillment("home_delivery")} />
              </div>

              {needsAddress && (
                <div className="space-y-3">
                  <Field label={t("address1")} value={line1} onChange={setLine1} placeholder={t("address1Placeholder")} />
                  <Field label={t("address2")} value={line2} onChange={setLine2} placeholder={t("address2Placeholder")} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("city")} value={city} onChange={setCity} />
                    <Field label={t("pincode")} value={pincode} onChange={setPincode} placeholder="500032" inputMode="numeric" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Field label={t("phone")} value={phone} onChange={setPhone} placeholder="98480 12345" inputMode="numeric" prefix="+91" />
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{t("deliveryDate")}</label>
                  <div className="px-3.5 py-3 border border-line rounded-[5px] bg-paper-2 font-mono text-[14px] text-ink-soft">
                    {formatDate(getNextSaturday())}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-cream border border-line rounded-card-lg p-6">
              <h3 className="font-serif text-[22px] font-medium mb-4">{t("payment")}</h3>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="px-4 py-3.5 border border-paddy rounded-[5px] bg-paper text-[14px] flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-[15px] text-ink">{t("cod")}</div>
                    <div className="text-muted text-[13px] mt-0.5">{t("codDetail")}</div>
                  </div>
                  <span className="font-mono text-paddy font-semibold">+{formatRupees(3000)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: summary */}
          <div className="bg-cream border border-line rounded-card-lg p-6 h-fit">
            <h3 className="font-serif text-[22px] font-medium mb-4">{t("orderSummary")}</h3>
            {items.map((i) => {
              const varietyLabel = i.variety === "other" && i.varietyName
                ? i.varietyName
                : tLabels(`variety.${i.variety}`);
              return (
                <div key={`${i.listingId}-${i.packKg}`} className="flex justify-between py-2 text-[13px] border-b border-dashed border-line-soft last:border-b-0">
                  <span className="text-ink-soft">
                    {varietyLabel} · {i.packKg}kg × {i.qty}
                  </span>
                  <span className="font-mono">{formatRupees(i.pricePerKgPaise * i.packKg * i.qty)}</span>
                </div>
              );
            })}
            <div className="mt-4 pt-4 border-t border-line space-y-1.5">
              <SumRow label={tCart("subtotal")} value={formatRupees(subtotal)} />
              <SumRow label={t("deliveryFeeLabel")} value={deliveryFee === 0 ? t("free") : formatRupees(deliveryFee)} />
              {cod > 0 && <SumRow label={t("codHandling")} value={formatRupees(cod)} />}
              {directSaving > 0 && <SumRow label={t("directSavingLabel")} value={`−${formatRupees(directSaving)}`} tone="paddy" />}
              <div className="flex justify-between pt-3 mt-2 border-t border-line font-serif text-[24px] font-semibold">
                <span>{t("total")}</span>
                <span>{formatRupees(total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={placeOrder}
              disabled={submitting || items.length === 0}
              className="w-full mt-5 py-4 bg-paddy text-cream rounded-card font-semibold text-[14px] tracking-[0.05em] uppercase hover:bg-paddy-2 transition-colors disabled:opacity-60"
            >
              {submitting
                ? t("placing")
                : t("placeOrder", { price: formatRupees(total) })}
            </button>
            <p className="text-[12px] text-muted mt-3.5 text-center">
              {t("farmerPayoutNote", { farmer: formatRupees(farmerReceives), fee: formatRupees(commissionPaise(subtotal)) })}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label, value, onChange, placeholder, inputMode, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  inputMode?: "numeric" | "text"; prefix?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{label}</label>
      <div className="flex items-stretch gap-2">
        {prefix && (
          <span className="inline-flex items-center px-3 border border-line rounded-[5px] bg-paper-2 font-mono text-[14px] text-ink-soft">{prefix}</span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="flex-1 px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] text-ink focus:outline-none focus:border-ink"
        />
      </div>
    </div>
  );
}

function SumRow({ label, value, tone }: { label: string; value: string; tone?: "paddy" }) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className={tone === "paddy" ? "text-paddy font-medium" : "text-ink-soft"}>{label}</span>
      <span className={tone === "paddy" ? "text-paddy font-semibold font-mono" : "font-mono"}>{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireRole role="customer">
      <CheckoutInner />
    </RequireRole>
  );
}
