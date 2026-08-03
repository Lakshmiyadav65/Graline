-- =============================================================================
-- Migration: Remove all demo/seed data from the database
-- Fixes Phase 8 (Remove Demo Data):
--   1. Deletes seed listings, listing images, and farmers
--   2. Deletes seed villages
--   3. Deletes profiles associated with seed farmers
--   4. Deletes auth.users records associated with seed farmers
-- =============================================================================

-- Disable trigger check temporarily to prevent trigger side-effects during purge
SET session_replication_role = 'replica';

-- ─── 1. Clean listings, listing images, and orders referencing seed farmers ──
DELETE FROM public.listing_images WHERE listing_id IN (
  SELECT id FROM public.listings WHERE farmer_id IN (
    'f1000000-0000-0000-0000-000000000001',
    'f2000000-0000-0000-0000-000000000002',
    'f3000000-0000-0000-0000-000000000003',
    'f4000000-0000-0000-0000-000000000004',
    'f5000000-0000-0000-0000-000000000005'
  )
);

DELETE FROM public.listings WHERE farmer_id IN (
  'f1000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f4000000-0000-0000-0000-000000000004',
  'f5000000-0000-0000-0000-000000000005'
);

-- ─── 2. Delete farmers ────────────────────────────────────────────────────────
DELETE FROM public.farmers WHERE id IN (
  'f1000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f4000000-0000-0000-0000-000000000004',
  'f5000000-0000-0000-0000-000000000005'
);

-- ─── 3. Delete villages ───────────────────────────────────────────────────────
DELETE FROM public.villages WHERE id IN (
  'b1000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000002',
  'b3000000-0000-0000-0000-000000000003',
  'b4000000-0000-0000-0000-000000000004',
  'b5000000-0000-0000-0000-000000000005'
);

-- ─── 4. Delete profiles ──────────────────────────────────────────────────────
DELETE FROM public.profiles WHERE id IN (
  'f1000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f4000000-0000-0000-0000-000000000004',
  'f5000000-0000-0000-0000-000000000005'
);

-- ─── 5. Delete auth.users ────────────────────────────────────────────────────
DELETE FROM auth.users WHERE id IN (
  'f1000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f4000000-0000-0000-0000-000000000004',
  'f5000000-0000-0000-0000-000000000005'
);

-- Restore replication role for normal triggers behavior
SET session_replication_role = 'origin';
