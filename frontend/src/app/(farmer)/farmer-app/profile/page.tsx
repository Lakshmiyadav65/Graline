"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import type { Village } from "@/lib/api/types";
import { getLocaleFromLanguage } from "@/lib/i18n";
import { useTranslations } from "next-intl";

export default function FarmerProfilePage() {
  const toast = useToast();
  const router = useRouter();
  const t = useTranslations("farmerProfile");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [villageId, setVillageId] = useState("");
  const [language, setLanguage] = useState("English");
  const [bio, setBio] = useState("");
  const [upiId, setUpiId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    // Load villages first
    const vRes = await api.villages.list();
    if (vRes.ok) {
      setVillages(vRes.data);
    }

    // Load farmer details
    const res = await api.farmer.me();
    setLoading(false);

    if (res.ok) {
      const p = res.data.profile;
      setName(p.name || "");
      setPhone(p.phone ? p.phone.replace("+91", "") : "");
      setVillageId(p.village?.id || "");
      setLanguage(p.preferred_language || "English");
      setBio(p.story || "");
      setUpiId(p.upi_id || "");
    } else {
      toast.show(res.error.message, "error");
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.show(t("nameRequired"), "error");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.show(t("phoneInvalid"), "error");
      return;
    }
    if (!villageId) {
      toast.show(t("villageRequired"), "error");
      return;
    }
    if (upiId && !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      toast.show(t("upiInvalid"), "error");
      return;
    }

    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.show(t("notLoggedIn"), "error");
      setBusy(false);
      return;
    }
    const userId = session.user.id;

    try {
      // 1. Update public.profiles
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          phone_number: `+91${phone.trim()}`,
          preferred_language: language,
        })
        .eq("id", userId);

      if (profileErr) throw profileErr;

      // 2. Update public.farmers
      const { error: farmerErr } = await supabase
        .from("farmers")
        .update({
          village_id: villageId,
          bio: bio.trim(),
          story: bio.trim(),
          upi_id: upiId.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (farmerErr) throw farmerErr;

      // Update cookie
      const newLocale = getLocaleFromLanguage(language);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

      toast.show(t("updatedSuccess"), "success");
      // Refresh router and reload page to apply new translation locale
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.show(err.message || t("failedUpdate"), "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-muted">{t("loading")}</div>;
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em]">{t("title")}</h1>
        <p className="text-muted text-[14px]">{t("sub")}</p>
      </div>

      <form onSubmit={handleSave} className="bg-cream border border-line rounded-card p-6 md:p-8 space-y-5">
        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
            {t("name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ramesh Varma"
            className="w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
            {t("phone")}
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-line border-r-0 rounded-l-[5px] bg-paper-2 font-mono text-[14px] text-ink-soft">
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98480 12345"
              className="flex-1 w-full px-3.5 py-2.5 border border-line rounded-r-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
            {t("village")}
          </label>
          <select
            value={villageId}
            onChange={(e) => setVillageId(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink"
            required
          >
            <option value="">{t("selectVillage")}</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} · {v.district}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
            {t("prefLanguage")}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink"
          >
            <option value="English">English</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
            <option value="Tamil">Tamil (தமிழ்)</option>
            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
            {t("bio")}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder={t("bioPlaceholder")}
            className="w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink resize-vertical"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
            {t("upi")}
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="ramesh.varma@ybl"
            className="w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full mt-4 py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors disabled:opacity-60"
        >
          {busy ? t("savingBtn") : t("saveBtn")}
        </button>
      </form>
    </div>
  );
}
