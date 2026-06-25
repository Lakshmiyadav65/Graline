import { KPICard } from "@/components/farmer/KPICard";
import { OrderRow } from "@/components/farmer/OrderRow";
import { farmerService } from "@/services/farmer.service";
import { createClient } from "@/server/supabase/server";
import { formatRupees } from "@/lib/format";
import Link from "next/link";
import { getTranslations } from "@/lib/translations";

export default async function FarmerDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations("FarmerDashboard");

  if (!user) {
    return <div className="text-muted text-[14px] py-12">{t("pleaseLogin")}</div>;
  }

  const data = await farmerService.getDashboardData(user.id);
  
  if (!data || !data.profile) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-[24px] mb-2">{t("welcome")}</h2>
        <p className="text-muted mb-6">{t("completeProfile")}</p>
        <Link href="/sell" className="px-4 py-2 bg-paddy text-white rounded">{t("completeProfileBtn")}</Link>
      </div>
    );
  }

  const { profile, stats } = data;
  const firstName = profile.full_name?.split(/\s+/)[0] || "Farmer";

  const incoming_orders: any[] = data.incoming_orders || [];

  return (
    <div>
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-1.5">
        {t("goodMorning")}, <em className="text-terra not-italic italic">{firstName}</em>.
      </h1>
      
      {incoming_orders.length > 0 ? (
        <p className="text-muted text-[14px] mb-7">
          {t("activeOrders", { count: incoming_orders.length })}
        </p>
      ) : (
        <p className="text-muted text-[14px] mb-7">{t("noActiveOrders")}</p>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        <KPICard 
          value={<em className="text-terra not-italic">{formatRupees(stats.revenue)}</em>} 
          label={t("totalEarnings")} 
          delta={t("lifetime")} 
        />
        <KPICard 
          value={<>{stats.totalOrders}</>} 
          label={t("totalOrders")} 
          delta={t("lifetime")} 
        />
        <KPICard 
          value={<>{stats.totalListings}</>} 
          label={t("activeListings")} 
          delta={t("currentlyLive")} 
        />
        <KPICard 
          value={<>{Math.round(stats.availableStock)}<span className="text-[14px] text-muted font-sans"> {t("kg")}</span></>} 
          label={t("stockRemaining")} 
        />
      </div>

      <h2 className="font-serif text-[24px] font-medium mb-4">{t("recentOrders")}</h2>
      {incoming_orders.length === 0 ? (
        <div className="p-[18px] bg-paper-2 rounded-card text-center text-muted text-[14px]">
          {t("noOrdersReceived")}
        </div>
      ) : (
        <div className="space-y-2.5">
          {incoming_orders.map((o) => <OrderRow key={o.order_number} order={o} />)}
        </div>
      )}
    </div>
  );
}
