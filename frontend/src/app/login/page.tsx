"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/server/supabase/client";
import { useTranslations } from "@/lib/translations";

function LoginInner() {
  const params = useSearchParams();
  const next = params.get("next") || "";
  const roleParam = params.get("role") || "";
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const supabase = createClient();

  const t = useTranslations("login");
  const tNav = useTranslations("navigation");

  // Auto-detect role intent from next parameter or role param
  const isFarmerIntent = roleParam === "farmer" || next.startsWith("/farmer-app") || next.startsWith("/sell");
  const [selectedRole, setSelectedRole] = useState<"customer" | "farmer">(
    isFarmerIntent ? "farmer" : "customer"
  );

  const handleGoogleLogin = async () => {
    setBusy(true);
    const defaultNext = selectedRole === "farmer" ? "/farmer-app" : "/account";
    const redirectNext = next || defaultNext;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${redirectNext}`,
        data: {
          role: selectedRole,
        },
      } as any,
    });
    
    if (error) {
      toast.show(error.message, "error");
      setBusy(false);
    }
  };

  return (
    <PageShell noFooter>
      <section className="py-12 sm:py-20 max-w-md mx-auto text-center">
        <Eyebrow>{tNav("signIn")}</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-4 mb-2"
          style={{ fontSize: "clamp(32px, 6vw, 44px)" }}
        >
          {t.rich("title", {
            emBrand: (chunks) => <em className="text-terra font-medium">{chunks}</em>
          })}
        </h1>
        
        <p className="text-[15px] text-ink-soft mb-6 mt-4">
          {t("sub")}
        </p>

        <div className="flex rounded-full bg-cream border border-line p-1 mb-8 max-w-[280px] mx-auto">
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`flex-1 py-1.5 text-center rounded-full text-[13px] font-medium transition-all ${
              selectedRole === "customer"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {t("imCustomer")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("farmer")}
            className={`flex-1 py-1.5 text-center rounded-full text-[13px] font-medium transition-all ${
              selectedRole === "farmer"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {t("imFarmer")}
          </button>
        </div>
        
        <Button 
          type="button" 
          variant="btn-big-primary" 
          disabled={busy} 
          onClick={handleGoogleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {busy ? t("signingIn") : t("continueGoogle")}
        </Button>

        <p className="text-[12px] text-muted mt-6">
          {t("terms")}
        </p>

        <div className="mt-10 pt-6 border-t border-line">
          <Link href="/" className="text-[13px] text-ink-soft hover:text-ink">
            {t("backHome")}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

export default function LoginPage() {
  const t = useTranslations("login");
  return (
    <Suspense
      fallback={
        <PageShell noFooter>
          <div className="py-24 text-center text-muted">{t("loading")}</div>
        </PageShell>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
