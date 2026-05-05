import { z } from "zod";

/** Indian E.164 phone: +91 followed by 6-9 then 9 digits. */
export const phoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, "Phone must be in +91XXXXXXXXXX format");

export const otpSchema = z.string().regex(/^\d{6}$/, "OTP must be 6 digits");

export const upiIdSchema = z
  .string()
  .regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID");

export const pincodeSchema = z.string().regex(/^\d{6}$/, "Invalid pincode");

export const addressSchema = z.object({
  label: z.string().min(1).max(40),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(80),
  pincode: pincodeSchema,
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type Address = z.infer<typeof addressSchema>;
