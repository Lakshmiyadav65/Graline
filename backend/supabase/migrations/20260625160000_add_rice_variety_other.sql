-- Migration: Add rice_variety_other column to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS rice_variety_other TEXT;
