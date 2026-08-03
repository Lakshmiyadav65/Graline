-- =============================================================================
-- Migration: Add email column to profiles table and update handle_new_user trigger
-- Fixes Phase 6 (Google Authentication):
--   1. Adds email column to public.profiles table
--   2. Updates trigger handle_new_user() to copy email from auth.users on insert
--   3. Backfills existing profile records with emails from auth.users
-- =============================================================================

-- ─── 1. Add email column to profiles table ──────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- ─── 2. Update handle_new_user trigger function ──────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, role, full_name, email)
  VALUES (
    new.id,
    new.phone,
    -- We can pass 'role' in the user metadata during sign up. Defaults to 'customer' if not provided.
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    phone_number = COALESCE(public.profiles.phone_number, EXCLUDED.phone_number);
  
  -- If the role is farmer, also initialize an empty farmer record
  IF COALESCE((new.raw_user_meta_data->>'role')::text, 'customer') = 'farmer' THEN
    INSERT INTO public.farmers (id) 
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. Backfill existing profiles with emails ──────────────────────────────
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id 
  AND p.email IS NULL 
  AND u.email IS NOT NULL;
