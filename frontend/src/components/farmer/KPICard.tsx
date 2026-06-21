import type { ReactNode } from "react";

export function KPICard({ value, label, delta }: { value: ReactNode; label: string; delta?: string }) {
  return (
    <div className="border border-line bg-cream rounded-card p-[18px]">
      <div className="font-serif text-[28px] sm:text-[32px] font-semibold leading-none tracking-[-0.01em]">{value}</div>
      <div className="text-[11px] tracking-[0.12em] uppercase text-muted mt-2">{label}</div>
      {delta && <div className="text-[11px] text-paddy mt-1.5 font-medium">{delta}</div>}
    </div>
  );
}
