import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

export interface CartItem {
  listingId: string;
  variety: string;
  type: string;
  farmerName: string;
  villageName: string;
  packKg: number;
  qty: number;
  pricePerKgPaise: number;
  retailPaise: number;
  photoUrl: string | null;
}

function sameLine(a: CartItem, b: { listingId: string; packKg: number }) {
  return a.listingId === b.listingId && a.packKg === b.packKg;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string, packKg: number) => void;
  updateQty: (listingId: string, packKg: number, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const idx = s.items.findIndex((i) => sameLine(i, item));
          if (idx >= 0) {
            const items = s.items.slice();
            items[idx] = { ...items[idx], qty: items[idx].qty + item.qty };
            return { items };
          }
          return { items: [...s.items, item] };
        }),
      removeItem: (listingId, packKg) =>
        set((s) => ({ items: s.items.filter((i) => !sameLine(i, { listingId, packKg })) })),
      updateQty: (listingId, packKg, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => !sameLine(i, { listingId, packKg }))
              : s.items.map((i) => (sameLine(i, { listingId, packKg }) ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "gl_cart" },
  ),
);

export function cartSubtotalPaise(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.pricePerKgPaise * i.packKg * i.qty, 0);
}

export function cartRetailPaise(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.retailPaise * i.packKg * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

/**
 * Hydration-safe item count for the TopBar badge. Returns 0 on the server
 * and the first client render (before zustand/persist rehydrates from
 * localStorage), then the real count — avoids a hydration mismatch.
 */
export function useCartCount(): number {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? cartCount(items) : 0;
}
