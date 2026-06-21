-- Add head_name and head_phone columns to villages table
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS head_name TEXT;
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS head_phone TEXT;
