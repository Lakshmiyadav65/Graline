"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/lib/auth/session-context";
import { api } from "@/lib/api/client";

const phoneFormSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});
type PhoneForm = z.infer<typeof phoneFormSchema>;

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "";
  const toast = useToast();
  const { refresh } = useSession();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [requestId, setRequestId] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<PhoneForm>({ resolver: zodResolver(phoneFormSchema) });

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function sendOtp(mobile: string) {
    const e164 = `+91${mobile}`;
    const res = await api.auth.requestOtp(e164);
    if (!res.ok) {
      toast.show(res.error.message, "error");
      return;
    }
    setPhone(e164);
    setRequestId(res.data.requestId);
    setDevOtp(res.data.devOtp);
    setStep("otp");
    setResendIn(30);
    setOtp("");
  }

  const onPhoneSubmit = handleSubmit((data) => sendOtp(data.mobile));

  async function verify() {
    if (otp.length !== 6) {
      toast.show("Enter the 6-digit code.", "error");
      return;
    }
    setVerifying(true);
    const res = await api.auth.verifyOtp({ phone, otp, requestId });
    setVerifying(false);
    if (!res.ok) {
      toast.show(res.error.message, "error");
      setOtp("");
      return;
    }
    await refresh();
    toast.show(`Signed in as ${res.data.user.name}`, "success");
    router.replace(next || res.data.redirectTo);
  }

  return (
    <PageShell noFooter>
      <section className="py-12 sm:py-20 max-w-md mx-auto">
        <Eyebrow>{step === "phone" ? "Sign in" : "Verify"}</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-4 mb-2"
          style={{ fontSize: "clamp(32px, 6vw, 44px)" }}
        >
          {step === "phone" ? (
            <>Sign in to <em className="text-terra font-medium">Grainline</em></>
          ) : (
            <>Enter your <em className="text-terra font-medium">code</em></>
          )}
        </h1>

        {step === "phone" ? (
          <>
            <p className="text-[15px] text-ink-soft mb-8">
              We&apos;ll text a 6-digit code to verify your number. Same sign-in for
              customers, farmers, and our team.
            </p>
            <form onSubmit={onPhoneSubmit} noValidate>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">
                Mobile number
              </label>
              <div className="flex items-stretch gap-2 mb-1">
                <span className="inline-flex items-center px-3.5 border border-line rounded-[5px] bg-paper-2 font-mono text-[15px] text-ink-soft">
                  +91
                </span>
                <input
                  {...register("mobile")}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98480 12345"
                  maxLength={10}
                  className="flex-1 px-3.5 py-3 border border-line rounded-[5px] bg-paper font-mono text-[15px] text-ink focus:outline-none focus:border-ink"
                />
              </div>
              {errors.mobile && (
                <p className="text-[12px] text-terra font-medium mb-2">{errors.mobile.message}</p>
              )}
              <Button type="submit" variant="btn-big-primary" disabled={isSubmitting} className="w-full mt-4">
                {isSubmitting ? "Sending…" : "Send OTP →"}
              </Button>
            </form>
            <p className="text-[12px] text-muted mt-6">
              By continuing you agree to Grainline&apos;s terms. New customers get an
              account automatically.
            </p>
          </>
        ) : (
          <>
            <p className="text-[15px] text-ink-soft mb-2">
              Sent to <span className="font-mono text-ink">{phone}</span>.{" "}
              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); }}
                className="text-terra font-medium hover:underline"
              >
                Change
              </button>
            </p>
            {devOtp && (
              <p className="text-[12px] text-muted mb-6 font-mono">
                Dev mode — code is {devOtp}
              </p>
            )}
            <div className="mb-6 mt-4">
              <OtpInput value={otp} onChange={setOtp} disabled={verifying} autoFocus />
            </div>
            <Button
              type="button"
              variant="btn-big-primary"
              onClick={verify}
              disabled={verifying || otp.length !== 6}
              className="w-full"
            >
              {verifying ? "Verifying…" : "Verify & continue →"}
            </Button>
            <div className="mt-5 text-[13px] text-muted">
              {resendIn > 0 ? (
                <span>Resend code in {resendIn}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => sendOtp(phone.replace("+91", ""))}
                  className="text-terra font-medium hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>
          </>
        )}

        <div className="mt-10 pt-6 border-t border-line">
          <Link href="/" className="text-[13px] text-ink-soft hover:text-ink">
            ← Back to home
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageShell noFooter>
          <div className="py-24 text-center text-muted">Loading…</div>
        </PageShell>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
