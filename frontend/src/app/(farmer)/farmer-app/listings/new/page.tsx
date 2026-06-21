"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { listingInputSchema } from "@/lib/schemas/listing";
import { VARIETY_LABEL } from "@/lib/labels";
import { formatRupees } from "@/lib/format";
import { MultipleImageUpload } from "@/components/farmer/MultipleImageUpload";
import type { RiceVariety, RiceType, HarvestSeason, PackSize, ListingInputDTO } from "@/lib/api/types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter as useNextRouter } from "next/navigation";

function packsFrom(base: number): PackSize[] {
  return [
    { kg: 1, price_per_kg_paise: base + 300 },
    { kg: 5, price_per_kg_paise: base + 100 },
    { kg: 10, price_per_kg_paise: base },
    { kg: 25, price_per_kg_paise: Math.max(100, base - 200) },
  ];
}

export default function NewListingPage() {
  const router = useNextRouter();
  const toast = useToast();
  const t = useTranslations("newListing");
  const tLabels = useTranslations("labels");
  const tEnroll = useTranslations("enroll");

  const [variety, setVariety] = useState<RiceVariety>("sona_masuri");
  const [type, setType] = useState<RiceType>("raw");
  const [organic, setOrganic] = useState(false);
  const [availableKg, setAvailableKg] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [harvestYear, setHarvestYear] = useState("2025");
  const [season, setSeason] = useState<HarvestSeason>("rabi");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const base = Math.round(Number(priceRupees) * 100);
    const input: ListingInputDTO = {
      variety, type, is_organic: organic,
      available_kg: Number(availableKg), price_per_kg: base, pack_sizes: packsFrom(base),
      harvest_year: Number(harvestYear), harvest_season: season, is_milled: true,
      photos, description: description || undefined,
    };
    const parsed = listingInputSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      let msg = t("checkDetails");
      if (issue) {
        if (issue.path.includes("available_kg")) {
          msg = tEnroll("stockValidation");
        } else if (issue.path.includes("price_per_kg")) {
          msg = tEnroll("priceValidation");
        }
      }
      toast.show(msg, "error");
      return;
    }
    setBusy(true);
    const res = await api.farmer.createListing(input);
    setBusy(false);
    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    toast.show(t("createdSuccess"), "success");
    router.push("/farmer-app/listings");
  }

  return (
    <div className="max-w-lg">
      <Link href="/farmer-app/listings" className="text-[13px] text-ink-soft hover:text-ink">{t("backListings")}</Link>
      <h1 className="font-serif text-[32px] font-normal tracking-[-0.02em] mt-3 mb-6">{t("title")}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("variety")}>
          <select value={variety} onChange={(e) => setVariety(e.target.value as RiceVariety)} className={selectCls}>
            {Object.keys(VARIETY_LABEL).map((k) => (
              <option key={k} value={k}>
                {tLabels(`variety.${k}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("type")}>
          <select value={type} onChange={(e) => setType(e.target.value as RiceType)} className={selectCls}>
            <option value="raw">{tLabels("type.raw")}</option>
            <option value="boiled">{tLabels("type.boiled")}</option>
            <option value="brown">{tLabels("type.brown")}</option>
            <option value="hand_pounded">{tLabels("type.hand_pounded")}</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("available")}>
          <input value={availableKg} onChange={(e) => setAvailableKg(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" placeholder="320" className={inputCls} />
        </Field>
        <Field label={t("price")}>
          <input value={priceRupees} onChange={(e) => setPriceRupees(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" placeholder="52" className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("harvestYear")}>
          <input value={harvestYear} onChange={(e) => setHarvestYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={inputCls} />
        </Field>
        <Field label={t("season")}>
          <select value={season} onChange={(e) => setSeason(e.target.value as HarvestSeason)} className={selectCls}>
            <option value="rabi">{tLabels("season.rabi")}</option>
            <option value="kharif">{tLabels("season.kharif")}</option>
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 my-2 text-[14px]">
        <input type="checkbox" checked={organic} onChange={(e) => setOrganic(e.target.checked)} /> {t("organic")}
      </label>
      
      <div className="mb-5">
        <MultipleImageUpload urls={photos} onChange={setPhotos} />
      </div>

      <Field label={t("description")}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls + " resize-vertical"} />
      </Field>

      {Number(priceRupees) > 0 && (
        <p className="text-[12px] text-muted mb-4">
          {t("pricingNote", { price: formatRupees(Number(priceRupees) * 100) })}
        </p>
      )}

      <button type="button" onClick={submit} disabled={busy} className="w-full py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors disabled:opacity-60">
        {busy ? t("saving") : t("createBtn")}
      </button>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink";
const selectCls = inputCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{label}</label>
      {children}
    </div>
  );
}
