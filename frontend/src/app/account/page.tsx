import { customerService } from "@/services/customer.service";
import { createClient } from "@/server/supabase/server";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileForm } from "@/components/customer/ProfileForm";
import { getTranslations } from "next-intl/server";

export default async function CustomerAccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const t = await getTranslations("customerAccount");

  if (!user) {
    return <PageShell><div className="text-muted text-[14px] py-12 text-center">{t("pleaseLogin")}</div></PageShell>;
  }

  const profile = await customerService.getProfile(user.id);
  
  if (!profile) {
    return <PageShell><div className="text-muted text-[14px] py-12 text-center">{t("profileNotFound")}</div></PageShell>;
  }

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-8">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileForm initialProfile={profile as any} googleUser={user as any} />

          <div className="space-y-4">
            <Link href="/account/orders" className="block bg-paper-2 hover:bg-cream border border-line rounded-card p-6 transition-colors">
              <h2 className="font-serif text-[24px] mb-2 text-terra">{t("myOrdersTitle")}</h2>
              <p className="text-muted text-[14px]">{t("myOrdersDesc")}</p>
            </Link>

            <Link href="/support" className="block bg-paper-2 hover:bg-cream border border-line rounded-card p-6 transition-colors">
              <h2 className="font-serif text-[24px] mb-2 text-terra">{t("supportTitle")}</h2>
              <p className="text-muted text-[14px]">{t("supportDesc")}</p>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
