-- =============================================================================
-- Grainline Seed Data — Realistic Telangana villages, farmers & rice listings
-- Mirrors the mock fixtures in src/lib/api/mock.ts exactly.
-- Uses fixed UUIDs so the seed is idempotent (safe to re-run with ON CONFLICT).
-- NOTE: farmers.id → profiles.id → auth.users.id.  We insert placeholder rows
--       into auth.users and public.profiles so the FKs are satisfied without
--       needing real authenticated sign-ups.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Auth placeholder users (bypass auth.users FK for seed data)
--    These are service-role inserts — they create "stub" auth accounts so
--    the farmer FK chain is satisfied. Real sign-in flow will upsert over them.
-- ---------------------------------------------------------------------------

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES
  ('f1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'ramesh.varma@grainline.seed', '', NOW(), NOW(), NOW(),
   '{"provider":"phone","providers":["phone"]}', '{"full_name":"Ramesh Varma"}', false, ''),
  ('f2000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'saritha.reddy@grainline.seed', '', NOW(), NOW(), NOW(),
   '{"provider":"phone","providers":["phone"]}', '{"full_name":"Saritha Reddy"}', false, ''),
  ('f3000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'nageshwar.rao@grainline.seed', '', NOW(), NOW(), NOW(),
   '{"provider":"phone","providers":["phone"]}', '{"full_name":"Nageshwar Rao"}', false, ''),
  ('f4000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lakshmi.devi@grainline.seed', '', NOW(), NOW(), NOW(),
   '{"provider":"phone","providers":["phone"]}', '{"full_name":"Lakshmi Devi"}', false, ''),
  ('f5000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'vikram.singh@grainline.seed', '', NOW(), NOW(), NOW(),
   '{"provider":"phone","providers":["phone"]}', '{"full_name":"Vikram Singh"}', false, '')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1. Profiles (role = farmer)
-- ---------------------------------------------------------------------------

INSERT INTO public.profiles (id, role, full_name, phone_number, preferred_language, created_at, updated_at)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'farmer', 'Ramesh Varma',   '+919876511111', 'Telugu',  NOW(), NOW()),
  ('f2000000-0000-0000-0000-000000000002', 'farmer', 'Saritha Reddy',  '+919876522222', 'Telugu',  NOW(), NOW()),
  ('f3000000-0000-0000-0000-000000000003', 'farmer', 'Nageshwar Rao',  '+919876533333', 'Telugu',  NOW(), NOW()),
  ('f4000000-0000-0000-0000-000000000004', 'farmer', 'Lakshmi Devi',   '+919876544444', 'Telugu',  NOW(), NOW()),
  ('f5000000-0000-0000-0000-000000000005', 'farmer', 'Vikram Singh',   '+919876555555', 'Hindi',   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Villages (5 authentic Telangana villages)
-- ---------------------------------------------------------------------------

INSERT INTO public.villages (id, name, state, district, pincode, slug, story, photo_url, hub_address, status, created_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001',
   'Konaipalli', 'Telangana', 'Karimnagar', '505186', 'konaipalli',
   'Black-cotton soil and bore-well irrigation. Three generations of paddy. The fields here flood-irrigate from the Manair canal in kharif and rely on bore-wells through rabi — giving a consistent double crop every year.',
   'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
   'Old school building, near Hanuman temple, Konaipalli, Karimnagar, 505186',
   'verified', NOW()),

  ('b2000000-0000-0000-0000-000000000002',
   'Pochampalli', 'Telangana', 'Yadadri', '508284', 'pochampalli',
   'Famous for ikat weaving, but the rice is just as careful. Pochampalli farmers grow Sona Masuri and heirloom red rice on well-watered red loam — each lot milled the same week it is harvested.',
   'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&q=80',
   'Cooperative society building, Bus stand road, Pochampalli, Yadadri, 508284',
   'verified', NOW()),

  ('b3000000-0000-0000-0000-000000000003',
   'Bhupalpalli', 'Telangana', 'Bhupalpalli', '506169', 'bhupalpalli',
   'Tank-fed paddy on red loam. Long-grain basmati specialists. The cool nights at 350 m elevation slow-develop the starch and give the grain its extra length and fragrance that district buyers rely on.',
   'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
   'MPDO office, Main road, Bhupalpalli, Bhupalpalli dist., 506169',
   'verified', NOW()),

  ('b4000000-0000-0000-0000-000000000004',
   'Choutuppal', 'Telangana', 'Yadadri', '508252', 'choutuppal',
   'Aromatic Jeera Samba grown at the edge of the Deccan plateau. The mineral-rich well water here gives the short grain its signature fragrance — prized by Tamil households for pongal and biryani.',
   'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
   'Gram panchayat office, Choutuppal, Yadadri, 508252',
   'verified', NOW()),

  ('b5000000-0000-0000-0000-000000000005',
   'Manthani', 'Telangana', 'Peddapalli', '505184', 'manthani',
   'On the banks of the Godavari. Hand-pounded rice still done here. Yadagiri''s family have used the same granite mortar for three generations — pounding softens the bran without stripping it, keeping iron and fibre intact.',
   'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80',
   'Old market square, Manthani, Peddapalli, 505184',
   'verified', NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Farmers (linked to profiles + villages)
-- ---------------------------------------------------------------------------

INSERT INTO public.farmers (
  id, village_id, bio, farm_size_acres,
  photo_url, farming_since_year, upi_id, story, status, aadhaar_last4,
  created_at, updated_at
)
VALUES
  ('f1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'Three-generation paddy family. Bore-well + canal irrigation, natural compost.',
   3.2,
   'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80',
   2008, 'ramesh.varma@ybl',
   'Family land for three generations. Bore-well irrigation, mostly natural inputs. Ramesh slow-ages his Sona Masuri for six months in jute sacks before milling — the extra wait shows in the fragrance.',
   'verified', '1234',
   NOW(), NOW()),

  ('f2000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000002',
   'Switched to direct sales last year. Daughter helps with WhatsApp orders.',
   2.5,
   'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&q=80',
   2012, 'saritha@paytm',
   'Switched to direct sales last year after seeing that mandi middlemen took 30 % of her price. Daughter Priyanka helps with WhatsApp orders and photo documentation of each lot.',
   'verified', '5678',
   NOW(), NOW()),

  ('f3000000-0000-0000-0000-000000000003',
   'b3000000-0000-0000-0000-000000000003',
   'Specialist in long-grain basmati. Ages rice for two seasons before sale.',
   6.0,
   'https://images.unsplash.com/photo-1472746729193-26b1b2ebb5ac?w=400&q=80',
   2002, 'nageshwar@upi',
   'Nageshwar has grown basmati for 22 years. He ages each lot in sealed gunny bags for a minimum of one season — the patience shows in the extra-long grain and the deep fragrance. Bulk customers return every year.',
   'verified', '9012',
   NOW(), NOW()),

  ('f4000000-0000-0000-0000-000000000004',
   'b2000000-0000-0000-0000-000000000002',
   'Heirloom red rice grown on family land for 40+ years.',
   1.8,
   'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=400&q=80',
   2010, 'lakshmi.devi@ybl',
   'Heirloom red rice variety passed down from Lakshmi''s grandmother. The seed has never been hybridised. High iron content, nutty aroma, and a bite that white rice cannot replicate.',
   'verified', '3456',
   NOW(), NOW()),

  ('f5000000-0000-0000-0000-000000000005',
   'b4000000-0000-0000-0000-000000000004',
   'Aromatic Jeera Samba farmer. Single-pass milling for full fragrance.',
   4.5,
   'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&q=80',
   2015, 'vikram@phonepe',
   'Vikram specialises in aromatic short-grain Jeera Samba — the variety prized by Tamil households for pongal and biryani. He single-pass mills within a week of harvest so the fragrance does not fade.',
   'verified', '7890',
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Listings (10 rice listings across 5 farmers)
-- ---------------------------------------------------------------------------

INSERT INTO public.listings (
  id, farmer_id, title, description, rice_variety,
  price_per_kg, stock_kg, is_active,
  type, is_organic, organic_certification,
  harvest_year, harvest_season, is_milled, milled_on,
  pack_sizes, retail_paise,
  created_at, updated_at
)
VALUES
  -- L1: Ramesh Varma — Sona Masuri Raw (flagship)
  ('a1000000-0000-0000-0000-000000000001',
   'f1000000-0000-0000-0000-000000000001',
   'Ramesh''s Slow-Aged Sona Masuri',
   'Slow-aged six months for a softer cook and a fuller fragrance. Single-pass milled, lightly polished, 0 % broken grains. Best for everyday meals — biryani, pulao, plain rice. Grown on black-cotton soil with bore-well irrigation in Konaipalli.',
   'sona_masuri',
   52.00, 320, true,
   'raw', false, null,
   2025, 'rabi', true, '2025-05-01 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5500},{"kg":5,"price_per_kg_paise":5300},{"kg":10,"price_per_kg_paise":5200},{"kg":25,"price_per_kg_paise":5000}]',
   8500,
   NOW(), NOW()),

  -- L2: Saritha Reddy — Sona Masuri Raw
  ('a2000000-0000-0000-0000-000000000002',
   'f2000000-0000-0000-0000-000000000002',
   'Saritha''s Fresh-Harvest Sona Masuri',
   'Fresh Rabi 2025 harvest from Pochampalli. Well-water irrigated, minimal inputs. Milled within the week of order — the freshest Sona Masuri on the platform. Soft, fluffy texture ideal for daily cooking.',
   'sona_masuri',
   53.00, 140, true,
   'raw', false, null,
   2025, 'rabi', true, '2025-05-05 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5600},{"kg":5,"price_per_kg_paise":5400},{"kg":10,"price_per_kg_paise":5300},{"kg":25,"price_per_kg_paise":5100}]',
   8500,
   NOW(), NOW()),

  -- L3: Ramesh Varma — BPT 5204 Raw
  ('a3000000-0000-0000-0000-000000000003',
   'f1000000-0000-0000-0000-000000000001',
   'Ramesh''s BPT 5204 (Samba)',
   'BPT 5204 — the slim-grained workhorse of the Telangana kitchen. Softens evenly, holds shape in pulao, absorbs rasam perfectly. Grown alongside Sona Masuri on the same black-cotton plots in Konaipalli.',
   'bpt_5204',
   49.00, 200, true,
   'raw', false, null,
   2025, 'rabi', true, '2025-05-01 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5200},{"kg":5,"price_per_kg_paise":5000},{"kg":10,"price_per_kg_paise":4900},{"kg":25,"price_per_kg_paise":4700}]',
   7500,
   NOW(), NOW()),

  -- L4: Saritha Reddy — BPT 5204 Raw
  ('a4000000-0000-0000-0000-000000000004',
   'f2000000-0000-0000-0000-000000000002',
   'Saritha''s BPT 5204 Daily Rice',
   'Fresh harvest BPT 5204, slim grain that softens beautifully. Pochampalli well water irrigation. Daily-meals workhorse — curd rice, sambar rice, bagara rice. Clean, neutral flavour that carries any curry.',
   'bpt_5204',
   48.00, 180, true,
   'raw', false, null,
   2025, 'rabi', true, '2025-05-05 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5100},{"kg":5,"price_per_kg_paise":4900},{"kg":10,"price_per_kg_paise":4800},{"kg":25,"price_per_kg_paise":4600}]',
   7500,
   NOW(), NOW()),

  -- L5: Nageshwar Rao — Basmati Aged 2yr
  ('a5000000-0000-0000-0000-000000000005',
   'f3000000-0000-0000-0000-000000000003',
   'Nageshwar''s 2-Year Aged Basmati',
   'Aged two full seasons in sealed gunny bags at Bhupalpalli. Long, fragrant grain with a dry, separate cook — the standard for dum biryani and pulao. Special-occasion rice at an honest farm price.',
   'basmati',
   118.00, 90, true,
   'raw', false, null,
   2023, 'kharif', true, '2025-04-15 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":12100},{"kg":5,"price_per_kg_paise":11900},{"kg":10,"price_per_kg_paise":11800},{"kg":25,"price_per_kg_paise":11600}]',
   17500,
   NOW(), NOW()),

  -- L6: Nageshwar Rao — Basmati 1yr aged
  ('a6000000-0000-0000-0000-000000000006',
   'f3000000-0000-0000-0000-000000000003',
   'Nageshwar''s 1-Year Aged Basmati',
   'One season aged Basmati from Bhupalpalli. Slightly milder fragrance than the 2-year lot, still exceptional. The tank-fed cool-night plots give this grain extra length. Gentler price for regular biryani nights.',
   'basmati',
   115.00, 60, true,
   'raw', false, null,
   2024, 'kharif', true, '2025-04-15 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":11800},{"kg":5,"price_per_kg_paise":11600},{"kg":10,"price_per_kg_paise":11500},{"kg":25,"price_per_kg_paise":11300}]',
   17500,
   NOW(), NOW()),

  -- L7: Vikram Singh — Jeera Samba
  ('a7000000-0000-0000-0000-000000000007',
   'f5000000-0000-0000-0000-000000000005',
   'Vikram''s Choutuppal Jeera Samba',
   'Aromatic short-grain Jeera Samba from Choutuppal''s mineral-rich well water. The traditional rice for pongal, bisibelebath, and Tamil-style biryani. Single-pass milled within 7 days of harvest to preserve aroma.',
   'jeera_samba',
   78.00, 140, true,
   'raw', false, null,
   2025, 'kharif', true, '2025-04-20 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":8100},{"kg":5,"price_per_kg_paise":7900},{"kg":10,"price_per_kg_paise":7800},{"kg":25,"price_per_kg_paise":7600}]',
   12000,
   NOW(), NOW()),

  -- L8: Lakshmi Devi — Heirloom Red Rice
  ('a8000000-0000-0000-0000-000000000008',
   'f4000000-0000-0000-0000-000000000004',
   'Lakshmi''s Heirloom Red Rice',
   'Heirloom red rice grown on the same family plot for over 40 years without hybridisation. Nutty bite, high-fibre bran intact, high iron content — a complete grain. The slight earthiness pairs well with sambar and rasam.',
   'red_rice',
   90.00, 60, true,
   'raw', false, null,
   2025, 'rabi', true, '2025-05-10 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":9300},{"kg":5,"price_per_kg_paise":9100},{"kg":10,"price_per_kg_paise":9000},{"kg":25,"price_per_kg_paise":8800}]',
   14000,
   NOW(), NOW()),

  -- L9: Saritha Reddy — Sona Masuri Boiled
  ('a9000000-0000-0000-0000-000000000009',
   'f2000000-0000-0000-0000-000000000002',
   'Saritha''s Parboiled Sona Masuri',
   'Parboiled Sona Masuri — pressure-steamed before milling to drive nutrients into the grain. Stays separate, lower glycemic index. Recommended for diabetic households and anyone wanting a firmer texture with curd rice or curries.',
   'sona_masuri',
   50.00, 95, true,
   'boiled', false, null,
   2025, 'rabi', true, '2025-05-05 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5300},{"kg":5,"price_per_kg_paise":5100},{"kg":10,"price_per_kg_paise":5000},{"kg":25,"price_per_kg_paise":4800}]',
   8500,
   NOW(), NOW()),

  -- L10: Vikram Singh — Jeera Samba (second lot, kharif 2024)
  ('a0000000-0000-0000-0000-000000000010',
   'f5000000-0000-0000-0000-000000000005',
   'Vikram''s Aged Jeera Samba (2024 Kharif)',
   'Previous kharif lot of Choutuppal Jeera Samba — aged one full season in gunny bags. Slightly drier cook than the fresh lot, more concentrated aroma. Ideal for those who prefer a less sticky, more separated grain in their pongal.',
   'jeera_samba',
   76.00, 80, true,
   'raw', false, null,
   2024, 'kharif', true, '2024-12-10 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":7900},{"kg":5,"price_per_kg_paise":7700},{"kg":10,"price_per_kg_paise":7600},{"kg":25,"price_per_kg_paise":7400}]',
   12000,
   NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. Listing Images (1–3 images per listing using Unsplash rice photography)
-- ---------------------------------------------------------------------------

INSERT INTO public.listing_images (id, listing_id, image_url, is_primary, created_at)
VALUES
  -- L1 images
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', true, NOW()),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80', false, NOW()),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80', false, NOW()),

  -- L2 images
  ('c2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002',
   'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80', true, NOW()),
  ('c2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002',
   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', false, NOW()),

  -- L3 images
  ('c3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003',
   'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80', true, NOW()),
  ('c3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003',
   'https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80', false, NOW()),

  -- L4 images
  ('c4000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000004',
   'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80', true, NOW()),

  -- L5 Basmati images
  ('c5000000-0000-0000-0000-000000000001', 'a5000000-0000-0000-0000-000000000005',
   'https://images.unsplash.com/photo-1694839878248-09e44a7dc21e?w=800&q=80', true, NOW()),
  ('c5000000-0000-0000-0000-000000000002', 'a5000000-0000-0000-0000-000000000005',
   'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', false, NOW()),
  ('c5000000-0000-0000-0000-000000000003', 'a5000000-0000-0000-0000-000000000005',
   'https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80', false, NOW()),

  -- L6 Basmati images
  ('c6000000-0000-0000-0000-000000000001', 'a6000000-0000-0000-0000-000000000006',
   'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', true, NOW()),
  ('c6000000-0000-0000-0000-000000000002', 'a6000000-0000-0000-0000-000000000006',
   'https://images.unsplash.com/photo-1694839878248-09e44a7dc21e?w=800&q=80', false, NOW()),

  -- L7 Jeera Samba images
  ('c7000000-0000-0000-0000-000000000001', 'a7000000-0000-0000-0000-000000000007',
   'https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=800&q=80', true, NOW()),
  ('c7000000-0000-0000-0000-000000000002', 'a7000000-0000-0000-0000-000000000007',
   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', false, NOW()),

  -- L8 Red Rice images
  ('c8000000-0000-0000-0000-000000000001', 'a8000000-0000-0000-0000-000000000008',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80', true, NOW()),
  ('c8000000-0000-0000-0000-000000000002', 'a8000000-0000-0000-0000-000000000008',
   'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80', false, NOW()),
  ('c8000000-0000-0000-0000-000000000003', 'a8000000-0000-0000-0000-000000000008',
   'https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80', false, NOW()),

  -- L9 Parboiled images
  ('c9000000-0000-0000-0000-000000000001', 'a9000000-0000-0000-0000-000000000009',
   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', true, NOW()),
  ('c9000000-0000-0000-0000-000000000002', 'a9000000-0000-0000-0000-000000000009',
   'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80', false, NOW()),

  -- L10 Aged Jeera Samba images
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010',
   'https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=800&q=80', true, NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. Mandi Prices (reference data for the Mandi Compare widget)
-- ---------------------------------------------------------------------------

INSERT INTO public.mandi_prices (id, commodity, market, state, modal_price, date, created_at)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'rice_paddy',        'Karimnagar APMC',        'Telangana', 2200, NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000002', 'rice_paddy',        'Warangal APMC',          'Telangana', 2150, NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000003', 'retail_sona_masuri','Hyderabad retail (avg)', 'Telangana', 8500, NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000004', 'retail_bpt_5204',   'Hyderabad retail (avg)', 'Telangana', 7500, NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000005', 'retail_basmati',    'Hyderabad retail (avg)', 'Telangana',17500, NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000006', 'retail_red_rice',   'Hyderabad retail (avg)', 'Telangana',14000, NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000007', 'retail_jeera_samba','Hyderabad retail (avg)', 'Telangana',12000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
