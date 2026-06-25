"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api/client";
import { farmerEnrollInputSchema } from "@/lib/schemas/farmer";
import { VARIETY_LABEL } from "@/lib/labels";
import { formatRupees } from "@/lib/format";
import type { Village, RiceVariety, RiceType, HarvestSeason, FarmerEnrollRequest, PackSize } from "@/lib/api/types";
import { useTranslations } from "@/lib/translations";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "gl_enroll";
const TOTAL_STEPS = 5;

interface EnrollState {
  step: number;
  phone: string; // 10 digits
  phoneVerified: boolean;
  name: string;
  photo_url: string;
  village_id: string;
  requestNew: boolean;
  vr_name: string;
  vr_district: string;
  vr_state: string;
  vr_pincode: string;
  vr_head_name: string;
  vr_head_phone: string;
  land_acres: string;
  story: string;
  since_year: string;
  upi_id: string;
  aadhaar_last4: string;
  l_variety: RiceVariety;
  l_type: RiceType;
  l_organic: boolean;
  l_available_kg: string;
  l_price_rupees: string;
  l_harvest_year: string;
  l_harvest_season: HarvestSeason;
  l_description: string;
}

const DEFAULT: EnrollState = {
  step: 1, phone: "", phoneVerified: false, name: "", photo_url: "",
  village_id: "", requestNew: false, vr_name: "", vr_district: "", vr_state: "", vr_pincode: "", vr_head_name: "", vr_head_phone: "",
  land_acres: "", story: "", since_year: "",
  upi_id: "", aadhaar_last4: "",
  l_variety: "sona_masuri", l_type: "raw", l_organic: false, l_available_kg: "", l_price_rupees: "",
  l_harvest_year: "2025", l_harvest_season: "rabi", l_description: "",
};

function packsFrom(basePaise: number): PackSize[] {
  return [
    { kg: 1, price_per_kg_paise: basePaise + 300 },
    { kg: 5, price_per_kg_paise: basePaise + 100 },
    { kg: 10, price_per_kg_paise: basePaise },
    { kg: 25, price_per_kg_paise: Math.max(100, basePaise - 200) },
  ];
}

export default function EnrollPage() {
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations("enroll");
  const tLabels = useTranslations("labels");
  const tSell = useTranslations("sell");

  const [s, setS] = useState<EnrollState>(DEFAULT);
  const [mounted, setMounted] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [busy, setBusy] = useState(false);

  // Load persisted progress + villages
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...DEFAULT, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setMounted(true);
    api.villages.list().then((r) => { if (r.ok) setVillages(r.data); });
  }, []);

  // Persist on change
  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [s, mounted]);

  const set = (patch: Partial<EnrollState>) => setS((prev) => ({ ...prev, ...patch }));

  if (!mounted) {
    return <PageShell noFooter><div className="py-24 text-center text-muted">{t("loading")}</div></PageShell>;
  }

  function sendOtp() {
    if (!/^[6-9]\d{9}$/.test(s.phone)) { toast.show(t("phoneValidation"), "error"); return; }
    set({ phoneVerified: true, step: 2 });
  }

  function next() {
    if (s.step === 2) {
      if (s.name.trim().length < 2) { toast.show(t("nameValidation"), "error"); return; }
      if (!s.requestNew && !s.village_id) { toast.show(t("villageValidation"), "error"); return; }
      if (s.requestNew && (!s.vr_name || !s.vr_district || !s.vr_state || !s.vr_pincode || !s.vr_head_name || !/^[6-9]\d{9}$/.test(s.vr_head_phone))) {
        toast.show(t("newVillageValidation"), "error"); return;
      }
    }
    if (s.step === 3) {
      if (!/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(s.upi_id)) { toast.show(t("upiValidation"), "error"); return; }
      if (s.aadhaar_last4 && !/^\d{4}$/.test(s.aadhaar_last4)) { toast.show(t("aadhaarValidation"), "error"); return; }
    }
    if (s.step === 4) {
      if (!(Number(s.l_available_kg) > 0)) { toast.show(t("stockValidation"), "error"); return; }
      if (!(Number(s.l_price_rupees) > 0)) { toast.show(t("priceValidation"), "error"); return; }
    }
    set({ step: Math.min(TOTAL_STEPS, s.step + 1) });
  }

  function back() {
    set({ step: Math.max(1, s.step - 1) });
  }

  function buildRequest(): FarmerEnrollRequest {
    const basePaise = Math.round(Number(s.l_price_rupees) * 100);
    return {
      phone: `+91${s.phone}`,
      name: s.name.trim(),
      photo_url: s.photo_url || undefined,
      village_id: s.requestNew ? undefined : s.village_id,
      village_request: s.requestNew
        ? { name: s.vr_name, district: s.vr_district, state: s.vr_state, pincode: s.vr_pincode, head_name: s.vr_head_name, head_phone: `+91${s.vr_head_phone}` }
        : undefined,
      land_acres: s.land_acres ? Number(s.land_acres) : undefined,
      story: s.story || undefined,
      farming_since_year: s.since_year ? Number(s.since_year) : undefined,
      upi_id: s.upi_id,
      aadhaar_last4: s.aadhaar_last4 || undefined,
      first_listing: {
        variety: s.l_variety, type: s.l_type, is_organic: s.l_organic,
        available_kg: Number(s.l_available_kg), price_per_kg: basePaise, pack_sizes: packsFrom(basePaise),
        harvest_year: Number(s.l_harvest_year), harvest_season: s.l_harvest_season, is_milled: true,
        photos: s.photo_url ? [s.photo_url] : [], description: s.l_description || undefined,
      },
    };
  }

  async function submit() {
    const req = buildRequest();
    const parsed = farmerEnrollInputSchema.safeParse(req);
    if (!parsed.success) { toast.show(parsed.error.issues[0]?.message ?? t("checkDetails"), "error"); return; }
    setBusy(true);
    const res = await api.farmer.enroll(req);
    setBusy(false);
    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    localStorage.removeItem(STORAGE_KEY);
    toast.show(t("successToast"), "success");
    router.push("/farmer-app");
  }

  return (
    <PageShell noFooter>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-0 my-8 rounded-card-lg overflow-hidden border border-line">
        {/* Left paddy panel */}
        <aside
          className="hidden lg:flex flex-col justify-between text-cream p-12"
          style={{
            background: "var(--paddy)",
            backgroundImage: "radial-gradient(circle at 100% 0%, rgba(199,156,58,.18), transparent 50%), radial-gradient(circle at 0% 100%, rgba(184,85,45,.15), transparent 50%)",
          }}
        >
          <div>
            <span className="font-mono text-[12px] tracking-[0.15em] uppercase opacity-70">{tSell("roleLabel")}</span>
            <h2 className="font-serif text-[40px] font-normal leading-[1.05] mt-4 mb-4">
              {tSell.rich("heroTitle", {
                emGold: (chunks) => <em className="text-gold font-medium">{chunks}</em>,
                br: () => <br />
              })}
            </h2>
            <ul className="space-y-3.5 mt-8 text-[15px]">
              {[t("bullet1"), t("bullet2"), t("bullet3"), t("bullet4")].map((bulletText) => (
                <li key={bulletText} className="flex gap-3"><span className="font-serif text-gold font-semibold">✓</span><span className="opacity-90">{bulletText}</span></li>
              ))}
            </ul>
          </div>
          <blockquote className="mt-10 pt-8 border-t border-cream/20">
            <p className="font-serif italic text-[20px] leading-[1.4]">{tSell("testimonialQuote")}</p>
            <cite className="text-[13px] opacity-70 mt-2.5 block not-italic">{tSell("testimonialAuthor")}</cite>
          </blockquote>
        </aside>

        {/* Right form */}
        <div className="p-7 sm:p-12 bg-paper max-w-[560px] w-full">
          {/* Step bar */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={"flex-1 h-1 rounded-full " + (i + 1 < s.step ? "bg-paddy" : i + 1 === s.step ? "bg-terra" : "bg-line")} />
            ))}
          </div>
          <Eyebrow>{t("stepTitle", { step: s.step, total: TOTAL_STEPS })}</Eyebrow>

          {/* STEP 1 — Phone */}
          {s.step === 1 && (
            <div className="mt-4">
              <h3 className="font-serif text-[30px] font-medium mb-1.5">{t("mobileTitle")}</h3>
              <p className="text-muted text-[14px] mb-6">{t("mobileSub")}</p>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{t("mobileLabel")}</label>
              <div className="flex gap-2 mb-3">
                <span className="inline-flex items-center px-3 border border-line rounded-[5px] bg-paper-2 font-mono text-[15px] text-ink-soft">+91</span>
                <input value={s.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" placeholder="98480 12345" className="flex-1 px-3.5 py-3 border border-line rounded-[5px] bg-paper font-mono text-[15px] focus:outline-none focus:border-ink" />
              </div>
              <button type="button" onClick={sendOtp} disabled={busy} className="mt-4 w-full py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors">{t("continueBtn")}</button>
            </div>
          )}

          {/* STEP 2 — About you */}
          {s.step === 2 && (
            <div className="mt-4">
              <h3 className="font-serif text-[30px] font-medium mb-1.5">{t("farmTitle")}</h3>
              <p className="text-muted text-[14px] mb-6">{t("farmSub")}</p>
              <Text label={t("fullName")} value={s.name} onChange={(v) => set({ name: v })} placeholder="Ramesh Varma" />
              <PhotoUpload value={s.photo_url} onChange={(v) => set({ photo_url: v })} />
              <div className="mb-3.5">
                <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{t("village")}</label>
                {!s.requestNew ? (
                  <select value={s.village_id} onChange={(e) => set({ village_id: e.target.value })} className="w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink">
                    <option value="">{t("selectVillage")}</option>
                    {villages.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.district}</option>)}
                  </select>
                ) : (
                  <div className="space-y-3 p-3.5 border border-dashed border-terra rounded-card">
                    <Text label={t("newVillageName")} value={s.vr_name} onChange={(v) => set({ vr_name: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Text label={t("state")} value={s.vr_state} onChange={(v) => set({ vr_state: v })} placeholder="e.g. Maharashtra" />
                      <Text label={t("district")} value={s.vr_district} onChange={(v) => set({ vr_district: v })} placeholder="Siddipet" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Text label={t("pincode")} value={s.vr_pincode} onChange={(v) => set({ vr_pincode: v.replace(/\D/g, "").slice(0, 6) })} placeholder="502103" inputMode="numeric" />
                      <Text label={t("villageHeadName")} value={s.vr_head_name} onChange={(v) => set({ vr_head_name: v })} placeholder="Anji Reddy" />
                    </div>
                    <Text label={t("villageHeadPhone")} value={s.vr_head_phone} onChange={(v) => set({ vr_head_phone: v.replace(/\D/g, "").slice(0, 10) })} placeholder="9848012345" inputMode="numeric" />
                  </div>
                )}
                <button type="button" onClick={() => set({ requestNew: !s.requestNew })} className="text-[13px] text-terra font-medium mt-2 hover:underline">
                  {s.requestNew ? t("pickVillage") : t("requestVillage")}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Text label={t("landAcres")} value={s.land_acres} onChange={(v) => set({ land_acres: v })} placeholder="3.2" inputMode="numeric" />
                <Text label={t("farmingSince")} value={s.since_year} onChange={(v) => set({ since_year: v.replace(/\D/g, "").slice(0, 4) })} placeholder="2008" inputMode="numeric" />
              </div>
              <Area label={t("story")} value={s.story} onChange={(v) => set({ story: v })} />
              <StepNav onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 3 — Payout */}
          {s.step === 3 && (
            <div className="mt-4">
              <h3 className="font-serif text-[30px] font-medium mb-1.5">{t("payTitle")}</h3>
              <p className="text-muted text-[14px] mb-6">{t("paySub")}</p>
              <Text label={t("upi")} value={s.upi_id} onChange={(v) => set({ upi_id: v })} placeholder="ramesh.varma@upi" />
              <Text label={t("aadhaar")} value={s.aadhaar_last4} onChange={(v) => set({ aadhaar_last4: v.replace(/\D/g, "").slice(0, 4) })} placeholder="4521" inputMode="numeric" />
              <StepNav onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 4 — First listing */}
          {s.step === 4 && (
            <div className="mt-4">
              <h3 className="font-serif text-[30px] font-medium mb-1.5">{t("firstListingTitle")}</h3>
              <p className="text-muted text-[14px] mb-6">{t("firstListingSub")}</p>
              <div className="grid grid-cols-2 gap-3">
                <Select label={t("variety")} value={s.l_variety} onChange={(v) => set({ l_variety: v as RiceVariety })} options={Object.keys(VARIETY_LABEL).map((k) => ({ value: k, label: tLabels(`variety.${k}`) }))} />
                <Select label={t("type")} value={s.l_type} onChange={(v) => set({ l_type: v as RiceType })} options={[{ value: "raw", label: tLabels("type.raw") }, { value: "boiled", label: tLabels("type.boiled") }, { value: "brown", label: tLabels("type.brown") }, { value: "hand_pounded", label: tLabels("type.hand_pounded") }]} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Text label={t("available")} value={s.l_available_kg} onChange={(v) => set({ l_available_kg: v.replace(/[^\d.]/g, "") })} placeholder="320" inputMode="numeric" />
                <Text label={t("price")} value={s.l_price_rupees} onChange={(v) => set({ l_price_rupees: v.replace(/[^\d.]/g, "") })} placeholder="52" inputMode="numeric" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Text label={t("harvestYear")} value={s.l_harvest_year} onChange={(v) => set({ l_harvest_year: v.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" />
                <Select label={t("season")} value={s.l_harvest_season} onChange={(v) => set({ l_harvest_season: v as HarvestSeason })} options={[{ value: "rabi", label: tLabels("season.rabi") }, { value: "kharif", label: tLabels("season.kharif") }]} />
              </div>
              <label className="flex items-center gap-2 my-2 text-[14px]">
                <input type="checkbox" checked={s.l_organic} onChange={(e) => set({ l_organic: e.target.checked })} /> {t("organic")}
              </label>
              <Area label={t("description")} value={s.l_description} onChange={(v) => set({ l_description: v })} />
              {Number(s.l_price_rupees) > 0 && (
                <p className="text-[12px] text-muted">
                  {t("packPricingNote", {
                    p1: formatRupees((Number(s.l_price_rupees) * 100) + 300),
                    p5: formatRupees((Number(s.l_price_rupees) * 100) + 100),
                    p10: formatRupees(Number(s.l_price_rupees) * 100),
                    p25: formatRupees((Number(s.l_price_rupees) * 100) - 200)
                  })}
                </p>
              )}
              <StepNav onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 5 — Review */}
          {s.step === 5 && (
            <div className="mt-4">
              <h3 className="font-serif text-[30px] font-medium mb-1.5">{t("reviewTitle")}</h3>
              <p className="text-muted text-[14px] mb-6">{t("reviewSub")}</p>
              <dl className="border-t border-line-soft text-[14px]">
                <Review k={t("reviewMobile")} v={`+91 ${s.phone}`} />
                <Review k={t("reviewName")} v={s.name} />
                <Review k={t("reviewVillage")} v={s.requestNew ? `${s.vr_name} ${t("reviewNewRequest")}` : (villages.find((v) => v.id === s.village_id)?.name ?? "—")} />
                <Review k={t("reviewLand")} v={s.land_acres ? t("reviewLandAcres", { acres: s.land_acres }) : "—"} />
                <Review k={t("reviewUpi")} v={s.upi_id} />
                <Review k={t("reviewListing")} v={t("reviewListingVal", { variety: tLabels(`variety.${s.l_variety}`), qty: s.l_available_kg, price: s.l_price_rupees })} />
              </dl>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={back} className="px-5 py-3.5 border border-ink rounded-card text-[13px] font-semibold uppercase tracking-[0.04em] hover:bg-ink hover:text-paper transition-all">{t("backBtn")}</button>
                <button type="button" onClick={submit} disabled={busy} className="flex-1 py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors disabled:opacity-60">
                  {busy ? t("submitting") : t("submitBtn")}
                </button>
              </div>
            </div>
          )}

          <p className="text-[12px] text-muted mt-8 text-center">
            {t("needHelp")} <Link href="/sell" className="text-terra font-medium">{t("backSell")}</Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function Text({ label, value, onChange, placeholder, inputMode }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; inputMode?: "numeric" | "text" }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className="w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink" />
    </div>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink resize-vertical" />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function PhotoUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const t = useTranslations("enroll");

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.show("Please log in to upload photos.", "error");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("farmer-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("farmer-images").getPublicUrl(fileName);
      if (data?.publicUrl) {
        onChange(data.publicUrl);
        toast.show("Photo uploaded successfully", "success");
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{t("photoLabel")}</label>
      <label className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[13px] cursor-pointer hover:border-ink transition-colors">
        <input type="file" accept="image/*" onChange={pick} className="hidden" />
        {uploading ? t("photoUploading") : value ? t("photoUploaded") : t("photoChoose")}
      </label>
    </div>
  );
}

function StepNav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const t = useTranslations("enroll");
  return (
    <div className="flex gap-3 mt-6">
      <button type="button" onClick={onBack} className="px-5 py-3.5 border border-ink rounded-card text-[13px] font-semibold uppercase tracking-[0.04em] hover:bg-ink hover:text-paper transition-all">{t("backBtn")}</button>
      <button type="button" onClick={onNext} className="flex-1 py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors">{t("continueBtn")}</button>
    </div>
  );
}

function Review({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-line-soft">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}
