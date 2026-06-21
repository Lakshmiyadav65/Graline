-- =============================================================================
-- Grainline Seed — Part 1: auth.users stubs
-- Run via: npx supabase db query --linked --file supabase/seed_auth.sql
-- =============================================================================

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
SELECT
  id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
  email, '', NOW(), NOW(), NOW(),
  '{"provider":"phone","providers":["phone"]}'::jsonb,
  jsonb_build_object('full_name', full_name, 'role', 'farmer'),
  false, '', '', '', ''
FROM (VALUES
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'ramesh.varma@grainline.seed',   'Ramesh Varma'),
  ('f2000000-0000-0000-0000-000000000002'::uuid, 'saritha.reddy@grainline.seed',  'Saritha Reddy'),
  ('f3000000-0000-0000-0000-000000000003'::uuid, 'nageshwar.rao@grainline.seed',  'Nageshwar Rao'),
  ('f4000000-0000-0000-0000-000000000004'::uuid, 'lakshmi.devi@grainline.seed',   'Lakshmi Devi'),
  ('f5000000-0000-0000-0000-000000000005'::uuid, 'vikram.singh@grainline.seed',   'Vikram Singh')
) AS t(id, email, full_name)
ON CONFLICT (id) DO NOTHING;
