"use client";

interface ShipOptProps {
  title: string;
  detail: string;
  fee: string;
  selected: boolean;
  onSelect: () => void;
}

/** Selectable fulfillment/payment tile. Matches DESIGN.html .ship-opt. */
export function ShipOpt({ title, detail, fee, selected, onSelect }: ShipOptProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={
        "text-left border rounded-card p-3.5 bg-paper transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paddy " +
        (selected
          ? "border-paddy shadow-[inset_0_0_0_1px_var(--paddy)] bg-[#f0ead4]"
          : "border-line hover:border-ink")
      }
    >
      <div className="font-serif text-[16px] font-medium">{title}</div>
      <div className="text-[11px] text-muted mt-1">{detail}</div>
      <div className="text-[13px] font-semibold text-ink mt-2 font-mono">{fee}</div>
    </button>
  );
}
