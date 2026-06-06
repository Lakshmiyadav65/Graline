import type { FarmerMini } from "@/lib/api/types";

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

/** Farmer provenance card. Matches DESIGN.html .farmer-card. */
export function FarmerCard({ farmer }: { farmer: FarmerMini }) {
  const parts = [
    farmer.land_acres ? `${farmer.land_acres} acres` : null,
    `${farmer.village.name}, ${farmer.village.district} district`,
    farmer.farming_since_year ? `Farming since ${farmer.farming_since_year}` : null,
  ].filter(Boolean);

  return (
    <div className="flex gap-3.5 items-center p-3.5 border border-line rounded-card bg-cream">
      <div
        className="w-[54px] h-[54px] rounded-full shrink-0 grid place-items-center font-serif text-white font-semibold text-[22px]"
        style={{ background: "linear-gradient(135deg, var(--terra) 0%, var(--gold) 100%)" }}
        aria-hidden="true"
      >
        {initials(farmer.name)}
      </div>
      <div>
        <div className="font-serif text-[18px] font-medium">{farmer.name}</div>
        <div className="text-[13px] text-muted">{parts.join(" · ")}</div>
      </div>
    </div>
  );
}
