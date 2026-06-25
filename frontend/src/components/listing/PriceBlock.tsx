import { formatRupees } from "@/lib/format";

/** Big price + retail comparison. Matches DESIGN.html .price-block. */
export function PriceBlock({ pricePaise, retailPaise }: { pricePaise: number; retailPaise: number }) {
  const saved = retailPaise - pricePaise;
  return (
    <div className="bg-cream border border-line rounded-card-lg p-5 mb-[22px]">
      <div className="font-serif text-[48px] font-semibold leading-none tracking-[-0.02em]">
        {formatRupees(pricePaise)}
        <span className="text-[14px] text-muted font-normal ml-1 font-sans">/kg</span>
      </div>
      <div className="text-[13px] text-ink-soft mt-2">
        vs branded retail <s className="text-muted">{formatRupees(retailPaise)}/kg</s>
        {saved > 0 && (
          <>
            {" · "}
            <span className="text-paddy font-semibold">You save {formatRupees(saved)}</span>
          </>
        )}
      </div>
    </div>
  );
}
