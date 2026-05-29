// Single source of truth for fees + commission. Used by the checkout summary
// (display) and the mock order creator (authoritative) so they can't drift.
// All values in integer paise.

import type { FulfillmentType, PaymentMethod } from "@/lib/api/types";

export const FREE_DELIVERY_THRESHOLD = 200_000; // ₹2,000
export const CITY_PICKUP_FEE = 5_000; // ₹50
export const HOME_DELIVERY_FEE = 12_000; // ₹120
export const COD_FEE = 3_000; // ₹30
export const COMMISSION_PCT = 0.1;

export function deliveryFeePaise(fulfillment: FulfillmentType, subtotalPaise: number): number {
  if (fulfillment === "city_pickup_point") return CITY_PICKUP_FEE;
  if (fulfillment === "home_delivery") {
    return subtotalPaise >= FREE_DELIVERY_THRESHOLD ? 0 : HOME_DELIVERY_FEE;
  }
  return 0; // farm_pickup
}

export function codFeePaise(method: PaymentMethod): number {
  return method === "cod" ? COD_FEE : 0;
}

export function commissionPaise(subtotalPaise: number): number {
  return Math.floor(subtotalPaise * COMMISSION_PCT);
}
