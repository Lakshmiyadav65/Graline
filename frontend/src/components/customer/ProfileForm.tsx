"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api/client";
import type { Address } from "@/lib/api/types";
import { getLocaleFromLanguage } from "@/lib/i18n";
import { useTranslations } from "@/lib/translations";

interface ProfileFormProps {
  initialProfile: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    preferred_language: "English" | "Telugu" | "Hindi" | "Tamil" | "Kannada" | null;
    delivery_address: any | null;
  };
  googleUser: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
  };
}

export function ProfileForm({ initialProfile, googleUser }: ProfileFormProps) {
  const toast = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  const t = useTranslations("profileForm");
  const tCheckout = useTranslations("checkout");

  // Form states
  const googleName = googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || "";
  const [fullName, setFullName] = useState(profile.full_name || googleName);
  const [phone, setPhone] = useState(profile.phone_number || "");
  const [lang, setLang] = useState(profile.preferred_language || "English");

  // Address states
  const savedAddress = (profile.delivery_address as Address) || null;
  const [line1, setLine1] = useState(savedAddress?.line1 || "");
  const [line2, setLine2] = useState(savedAddress?.line2 || "");
  const [city, setCity] = useState(savedAddress?.city || "Hyderabad");
  const [pincode, setPincode] = useState(savedAddress?.pincode || "");

  const [saving, setSaving] = useState(false);

  const displayLanguage = profile.preferred_language || "English";

  const displayLanguageText = displayLanguage === "English" 
    ? "English" 
    : displayLanguage === "Telugu" 
    ? "Telugu (తెలుగు)" 
    : displayLanguage === "Hindi" 
    ? "Hindi (हिन्दी)" 
    : displayLanguage === "Tamil" 
    ? "Tamil (தமிழ்)" 
    : displayLanguage === "Kannada" 
    ? "Kannada (ಕನ್ನಡ)" 
    : "English";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.show(t("nameRequired"), "error");
      return;
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace("+91", "").trim())) {
      toast.show(t("phoneInvalid"), "error");
      return;
    }
    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      toast.show(t("pincodeInvalid"), "error");
      return;
    }

    setSaving(true);

    const addressObj: Address | null = line1.trim()
      ? {
          label: "Primary Delivery",
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          pincode: pincode.trim(),
        }
      : null;

    const res = await api.customer.updateProfile({
      full_name: fullName.trim(),
      phone_number: phone.trim() ? (phone.startsWith("+91") ? phone.trim() : `+91${phone.trim()}`) : undefined,
      preferred_language: lang,
      delivery_address: addressObj || undefined,
    });

    setSaving(false);

    if (res.ok) {
      // Update cookie
      const newLocale = getLocaleFromLanguage(lang);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      
      // Update Google Translate localStorage and cookies so translation works on reload
      localStorage.setItem("grainline_lang", newLocale);
      const gtValue = `/en/${newLocale}`;
      document.cookie = `googtrans=${gtValue}; path=/;`;
      document.cookie = `googtrans=${gtValue}; path=/; domain=${location.hostname};`;

      toast.show(t("profileUpdated"), "success");
      setProfile({
        id: res.data.id,
        full_name: res.data.name,
        phone_number: res.data.phone,
        preferred_language: (res.data.preferred_language || "English") as any,
        delivery_address: res.data.delivery_address,
      });
      setIsEditing(false);
      
      // Refresh router and reload page to apply new translation locale
      router.refresh();
      window.location.reload();
    } else {
      toast.show(res.error.message, "error");
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="bg-cream border border-line rounded-card p-6 md:p-8 space-y-6">
        <h2 className="font-serif text-[24px] text-ink border-b border-line-soft pb-3">{t("editTitle")}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
              {t("fullName")}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
              {t("email")}
            </label>
            <input
              type="email"
              value={googleUser.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper-2 text-[15px] text-ink-soft cursor-not-allowed font-mono"
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
                value={phone.replace("+91", "")}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98480 12345"
                className="flex-1 w-full px-3.5 py-2.5 border border-line rounded-r-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
              {t("prefLanguage")}
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink"
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
            </select>
          </div>

          <div className="border-t border-line-soft pt-4 mt-6">
            <h3 className="font-serif text-[18px] mb-3 text-ink-soft">{t("deliveryAddress")}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">
                  {tCheckout("address1")}
                </label>
                <input
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder={tCheckout("address1Placeholder")}
                  className="w-full px-3.5 py-2 border border-line rounded-[5px] bg-paper text-[14px] focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">
                  {tCheckout("address2")}
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder={tCheckout("address2Placeholder")}
                  className="w-full px-3.5 py-2 border border-line rounded-[5px] bg-paper text-[14px] focus:outline-none focus:border-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">
                    {tCheckout("city")}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hyderabad"
                    className="w-full px-3.5 py-2 border border-line rounded-[5px] bg-paper text-[14px] focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">
                    {tCheckout("pincode")}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="500001"
                    className="w-full px-3.5 py-2 border border-line rounded-[5px] bg-paper text-[14px] focus:outline-none focus:border-ink font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-paddy text-cream rounded-card font-semibold text-[13px] tracking-[0.05em] uppercase hover:bg-paddy-2 transition-colors disabled:opacity-60"
          >
            {saving ? t("saving") : t("saveChanges")}
          </button>
          <button
            type="button"
            onClick={() => {
              setFullName(profile.full_name || googleName);
              setPhone(profile.phone_number || "");
              setLang(profile.preferred_language || "English");
              setLine1(savedAddress?.line1 || "");
              setLine2(savedAddress?.line2 || "");
              setCity(savedAddress?.city || "Hyderabad");
              setPincode(savedAddress?.pincode || "");
              setIsEditing(false);
            }}
            className="px-6 py-3 border border-line rounded-card text-[13px] font-semibold uppercase tracking-[0.05em] hover:bg-paper-2 transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-cream border border-line rounded-card p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-line-soft pb-3">
        <h2 className="font-serif text-[24px] text-ink">{t("detailsTitle")}</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="text-[13px] font-semibold text-terra uppercase tracking-[0.05em] hover:underline"
        >
          {t("editBtn")}
        </button>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">{t("fullName")}</label>
          <div className="text-[16px] text-ink font-medium">{profile.full_name || googleName || "Grainline User"}</div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">{t("email")}</label>
          <div className="text-[16px] text-ink font-mono">{googleUser.email || "No email linked"}</div>
        </div>

        {/* Phone: Only show if set */}
        {profile.phone_number && (
          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">{t("phone")}</label>
            <div className="text-[16px] text-ink font-mono">{profile.phone_number}</div>
          </div>
        )}

        {/* Preferred Language */}
        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">
            {t("prefLanguage")}
          </label>
          <div className="text-[16px] text-ink">{displayLanguageText}</div>
        </div>

        {/* Delivery Address: Only show if set */}
        {savedAddress && savedAddress.line1 && (
          <div className="border-t border-line-soft pt-4 mt-4">
            <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">
              {t("deliveryAddress")}
            </label>
            <div className="text-[15px] text-ink space-y-1">
              <div>{savedAddress.line1}</div>
              {savedAddress.line2 && <div>{savedAddress.line2}</div>}
              <div>
                {savedAddress.city} - <span className="font-mono">{savedAddress.pincode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
