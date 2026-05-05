import { z } from "zod";

export const riceVarietyEnum = z.enum([
  "sona_masuri",
  "bpt_5204",
  "basmati",
  "jeera_samba",
  "red_rice",
  "brown_rice",
  "hand_pounded_sona",
  "other",
]);

export const riceTypeEnum = z.enum(["raw", "boiled", "brown", "hand_pounded"]);
export const harvestSeasonEnum = z.enum(["kharif", "rabi"]);

export const packSizeSchema = z.object({
  kg: z.number().positive(),
  price_per_kg_paise: z.number().int().positive(),
});

export const listingInputSchema = z.object({
  variety: riceVarietyEnum,
  variety_other: z.string().max(80).optional(),
  type: riceTypeEnum,
  is_organic: z.boolean().default(false),
  organic_certification: z.string().max(120).optional(),
  available_kg: z.number().positive(),
  price_per_kg: z.number().int().positive(), // paise
  pack_sizes: z.array(packSizeSchema).min(1),
  harvest_year: z.number().int().min(2020).max(2100).optional(),
  harvest_season: harvestSeasonEnum.optional(),
  is_milled: z.boolean().default(true),
  milled_on: z.coerce.date().optional(),
  photos: z.array(z.string().url()).default([]),
  description: z.string().max(2000).optional(),
});

export type ListingInput = z.infer<typeof listingInputSchema>;
export type PackSize = z.infer<typeof packSizeSchema>;
