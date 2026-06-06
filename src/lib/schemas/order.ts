import { z } from "zod";
import { addressSchema, phoneSchema } from "./common";

export const fulfillmentEnum = z.enum([
  "farm_pickup",
  "city_pickup_point",
  "home_delivery",
]);

export const paymentMethodEnum = z.enum(["upi", "card", "cod"]);

export const orderItemInputSchema = z.object({
  listing_id: z.string().min(1),
  pack_kg: z.number().positive(),
  qty: z.number().int().positive().max(100),
});

export const orderInputSchema = z.object({
  items: z.array(orderItemInputSchema).min(1),
  fulfillment_type: fulfillmentEnum,
  delivery_address: addressSchema.optional(),
  phone: phoneSchema.optional(),
  payment_method: paymentMethodEnum,
}).refine(
  (data) => data.fulfillment_type === "farm_pickup" || !!data.delivery_address,
  { message: "delivery_address required for non-farm pickup", path: ["delivery_address"] },
);

export type OrderInput = z.infer<typeof orderInputSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
