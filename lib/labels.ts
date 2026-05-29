import type { RiceVariety, RiceType, HarvestSeason, OrderStatus } from "@/lib/api/types";
import type { PillTone } from "@/components/ui/Pill";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  milling: "Milling",
  ready: "Ready",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export function orderStatusTone(status: OrderStatus): PillTone {
  switch (status) {
    case "placed": return "pending";
    case "confirmed":
    case "milling":
    case "picked_up":
    case "in_transit": return "confirmed";
    case "ready": return "ready";
    case "delivered": return "paddy";
    case "cancelled":
    case "disputed": return "terra";
    default: return "neutral";
  }
}

export const VARIETY_LABEL: Record<RiceVariety, string> = {
  sona_masuri: "Sona Masuri",
  bpt_5204: "BPT 5204",
  basmati: "Basmati",
  jeera_samba: "Jeera Samba",
  red_rice: "Red Rice",
  brown_rice: "Brown Rice",
  hand_pounded_sona: "Hand-pounded Sona",
  other: "Other",
};

export const TYPE_LABEL: Record<RiceType, string> = {
  raw: "Raw, single-polish",
  boiled: "Parboiled",
  brown: "Brown / unpolished",
  hand_pounded: "Hand-pounded",
};

export const SEASON_LABEL: Record<HarvestSeason, string> = {
  kharif: "Kharif",
  rabi: "Rabi",
};

// Per-variety photo-placeholder gradients (verbatim from DESIGN.html LISTINGS).
export const VARIETY_GRADIENT: Record<RiceVariety, string> = {
  sona_masuri: "linear-gradient(135deg,#e6d4a0 0%,#b89c5c 60%,#7a5e2c 100%)",
  bpt_5204: "linear-gradient(135deg,#dcc890 0%,#a88d50 100%)",
  basmati: "linear-gradient(135deg,#f0e2b6 0%,#c4a86c 100%)",
  jeera_samba: "linear-gradient(135deg,#e8d49c 0%,#a88c4c 100%)",
  red_rice: "linear-gradient(135deg,#a8462a 0%,#5a2412 100%)",
  brown_rice: "linear-gradient(135deg,#c9a86a 0%,#6b4f24 100%)",
  hand_pounded_sona: "linear-gradient(135deg,#dcc080 0%,#8c6e30 100%)",
  other: "linear-gradient(135deg,#d4c490 0%,#8c7a4a 100%)",
};

export function varietyDisplay(l: { variety: RiceVariety; variety_other: string | null }): string {
  return l.variety === "other" && l.variety_other ? l.variety_other : VARIETY_LABEL[l.variety];
}
