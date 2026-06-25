import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { farmerService } from "@/services/farmer.service";
import { createClient } from "@/server/supabase/server";
import { formatRupees } from "@/lib/format";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { getTranslations } from "@/lib/translations";

const PAYOUT_TONE: Record<string, PillTone> = {
  paid: "paddy", pending: "pending", processing: "confirmed", failed: "terra",
};

export default async function EarningsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const t = await getTranslations("farmerEarnings");
  const tLabels = await getTranslations("labels");

  if (!user) {
    return <div className="text-muted text-[14px] py-12">{t("pleaseLogin")}</div>;
  }

  // Earnings data should be pulled from actual payout tables.
  const { data: payouts } = await supabase.from("payouts").select("*").eq("farmer_id", user.id).order('created_at', { ascending: false });

  // For chart, we would group by week. We'll leave the chart skeleton for now
  // since the mock was hardcoded and we need real data structure.

  return (
    <div>
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-1.5">
        {t.rich("title", {
          emPayouts: (chunks) => <em className="text-terra not-italic italic">{chunks}</em>
        })}
      </h1>
      
      {!payouts || payouts.length === 0 ? (
        <div className="text-muted text-[14px] py-12">{t("noHistory")}</div>
      ) : (
        <>
          <h2 className="font-serif text-[24px] font-medium mb-4 mt-8">{t("recent")}</h2>
          <div className="space-y-2.5">
            {payouts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-line bg-cream rounded-card">
                <div>
                  <div className="font-serif text-[16px] font-medium">{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold">{formatRupees(p.amount * 100)}</span>
                  <Pill tone={PAYOUT_TONE[p.status]}>{tLabels(`payoutStatus.${p.status}`)}</Pill>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
