import { z } from "zod";
import { phoneSchema, upiIdSchema } from "./common";
import { listingInputSchema } from "./listing";

export const farmerEnrollInputSchema = z.object({
  // Step 1: identity (phone is verified by OTP separately)
  phone: phoneSchema,
  name: z.string().min(2).max(80),

  // Step 2: about you
  photo_url: z.string().url().optional(),
  village_id: z.string().min(1).optional(),       // existing village
  village_request: z.object({                      // OR new village request
    name: z.string().min(2).max(80),
    district: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    head_name: z.string().min(2).max(80),
    head_phone: phoneSchema,
  }).optional(),
  land_acres: z.number().positive().max(10000).optional(),
  story: z.string().max(2000).optional(),
  farming_since_year: z.number().int().min(1950).max(new Date().getFullYear()).optional(),

  // Step 3: payout details
  upi_id: upiIdSchema,
  aadhaar_last4: z.string().regex(/^\d{4}$/, "Last 4 digits of Aadhaar").optional(),

  // Step 4: first listing
  first_listing: listingInputSchema,
}).refine(
  (data) => !!data.village_id || !!data.village_request,
  { message: "Either village_id or village_request is required", path: ["village_id"] },
);

export type FarmerEnrollInput = z.infer<typeof farmerEnrollInputSchema>;
