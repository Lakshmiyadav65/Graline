"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { listingInputSchema } from "@/lib/schemas/listing";
import { VARIETY_LABEL } from "@/lib/labels";
import { formatRupees } from "@/lib/format";
import { MultipleImageUpload } from "@/components/farmer/MultipleImageUpload";
import type { RiceVariety, RiceType, HarvestSeason, PackSize, ListingInputDTO, ListingStatus } from "@/lib/api/types";
import { useTranslations } from "next-intl";

function packsFrom(base: number): PackSize[] {
  return [
    { kg: 1, price_per_kg_paise: base + 300 },
    { kg: 5, price_per_kg_paise: base + 100 },
    { kg: 10, price_per_kg_paise: base },
    { kg: 25, price_per_kg_paise: Math.max(100, base - 200) },
  ];
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const toast = useToast();

  const tNew = useTranslations("newListing");
  const tEdit = useTranslations("editListing");
  const tLabels = useTranslations("labels");
  const tEnroll = useTranslations("enroll");

  const [loading, setLoading] = useState(true);
  const [variety, setVariety] = useState<RiceVariety>("sona_masuri");
  const [type, setType] = useState<RiceType>("raw");
  const [organic, setOrganic] = useState(false);
  const [availableKg, setAvailableKg] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [harvestYear, setHarvestYear] = useState("2025");
  const [season, setSeason] = useState<HarvestSeason>("rabi");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState<ListingStatus>("active");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.listings.get(id).then((res) => {
      setLoading(false);
      if (res.ok) {
        const l = res.data;
        setVariety(l.variety);
        setType(l.type);
        setOrganic(l.is_organic);
        setAvailableKg(String(l.available_kg));
        setPriceRupees(String(l.price_per_kg / 100)); // convert paise to Rupees
        setHarvestYear(String(l.harvest_year || "2025"));
        setSeason(l.harvest_season || "rabi");
        setDescription(l.description || "");
        setPhotos(l.photos || []);
        setStatus(l.status || "active");
      } else {
        toast.show(tEdit("notFound"), "error");
        router.push("/farmer-app/listings");
      }
    });
  }, [id, router, toast, tEdit]);

  async function handleSave() {
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
      let msg = tNew("checkDetails");
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
    // Update listing fields plus status
    const res = await api.farmer.updateListing(id, {
      ...input,
      status
    } as any);
    setBusy(false);

    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    toast.show(tEdit("success"), "success");
    router.push("/farmer-app/listings");
  }

  async function handleDelete() {
    if (!confirm(tEdit("deleteConfirm"))) return;
    
    setDeleting(true);
    const res = await api.farmer.deleteListing(id);
    setDeleting(false);

    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    toast.show(tEdit("deletedSuccess"), "success");
    router.push("/farmer-app/listings");
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-muted">{tEdit("loading")}</div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/farmer-app/listings" className="text-[13px] text-ink-soft hover:text-ink">{tNew("backListings")}</Link>
        <h1 className="font-serif text-[32px] font-normal tracking-[-0.02em] mt-3">{tEdit("title")}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={tNew("variety")}>
          <select value={variety} onChange={(e) => setVariety(e.target.value as RiceVariety)} className={selectCls}>
            {Object.keys(VARIETY_LABEL).map((k) => (
              <option key={k} value={k}>
                {tLabels(`variety.${k}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={tNew("type")}>
          <select value={type} onChange={(e) => setType(e.target.value as RiceType)} className={selectCls}>
            <option value="raw">{tLabels("type.raw")}</option>
            <option value="boiled">{tLabels("type.boiled")}</option>
            <option value="brown">{tLabels("type.brown")}</option>
            <option value="hand_pounded">{tLabels("type.hand_pounded")}</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={tNew("available")}>
          <input value={availableKg} onChange={(e) => setAvailableKg(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" placeholder="320" className={inputCls} />
        </Field>
        <Field label={tNew("price")}>
          <input value={priceRupees} onChange={(e) => setPriceRupees(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" placeholder="52" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={tNew("harvestYear")}>
          <input value={harvestYear} onChange={(e) => setHarvestYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={inputCls} />
        </Field>
        <Field label={tNew("season")}>
          <select value={season} onChange={(e) => setSeason(e.target.value as HarvestSeason)} className={selectCls}>
            <option value="rabi">{tLabels("season.rabi")}</option>
            <option value="kharif">{tLabels("season.kharif")}</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={tEdit("status")}>
          <select value={status} onChange={(e) => setStatus(e.target.value as ListingStatus)} className={selectCls}>
            <option value="active">{tEdit("statusActive")}</option>
            <option value="paused">{tEdit("statusPaused")}</option>
            <option value="draft">{tEdit("statusDraft")}</option>
            <option value="out_of_stock">{tEdit("statusOutOfStock")}</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 mt-8 text-[14px]">
          <input type="checkbox" checked={organic} onChange={(e) => setOrganic(e.target.checked)} /> {tNew("organic")}
        </label>
      </div>

      <div className="mb-5">
        <MultipleImageUpload urls={photos} onChange={setPhotos} />
      </div>

      <Field label={tNew("description")}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls + " resize-vertical"} />
      </Field>

      {Number(priceRupees) > 0 && (
        <p className="text-[12px] text-muted">
          {tNew("pricingNote", { price: formatRupees(Number(priceRupees) * 100) })}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-line-soft">
        <button type="button" onClick={handleSave} disabled={busy || deleting} className="flex-1 py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors disabled:opacity-60">
          {busy ? tEdit("savingChanges") : tEdit("saveChanges")}
        </button>
        <button type="button" onClick={handleDelete} disabled={busy || deleting} className="py-3.5 px-6 border border-terra text-terra rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-terra hover:text-white transition-colors disabled:opacity-60">
          {deleting ? tEdit("deleting") : tEdit("deleteBtn")}
        </button>
      </div>
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
