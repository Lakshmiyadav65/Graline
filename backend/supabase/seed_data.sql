-- =============================================================================
-- Grainline Seed — Part 2: Profiles, Villages, Farmers, Listings, Images
-- Fixed UUIDs so the seed is idempotent (safe to re-run).
-- Run via: npx supabase db query --linked --file supabase/seed_data.sql
-- =============================================================================

-- ── Profiles ──────────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, role, full_name, phone_number, preferred_language, created_at, updated_at)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'farmer', 'Ramesh Varma',   '+919876511111', 'Telugu',  NOW(), NOW()),
  ('f2000000-0000-0000-0000-000000000002', 'farmer', 'Saritha Reddy',  '+919876522222', 'Telugu',  NOW(), NOW()),
  ('f3000000-0000-0000-0000-000000000003', 'farmer', 'Nageshwar Rao',  '+919876533333', 'Telugu',  NOW(), NOW()),
  ('f4000000-0000-0000-0000-000000000004', 'farmer', 'Lakshmi Devi',   '+919876544444', 'Telugu',  NOW(), NOW()),
  ('f5000000-0000-0000-0000-000000000005', 'farmer', 'Vikram Singh',   '+919876555555', 'Hindi',   NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone_number = EXCLUDED.phone_number,
  preferred_language = EXCLUDED.preferred_language,
  updated_at = EXCLUDED.updated_at;

-- ── Villages ──────────────────────────────────────────────────────────────────
INSERT INTO public.villages
  (id, name, state, district, pincode, slug, story, photo_url, hub_address, status, created_at)
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
   'On the banks of the Godavari. Hand-pounded rice still done here. The family has used the same granite mortar for three generations — pounding softens the bran without stripping it, keeping iron and fibre intact.',
   'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80',
   'Old market square, Manthani, Peddapalli, 505184',
   'verified', NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Farmers ───────────────────────────────────────────────────────────────────
INSERT INTO public.farmers
  (id, village_id, bio, farm_size_acres, photo_url, farming_since_year,
   upi_id, story, status, aadhaar_last4, created_at, updated_at)
VALUES
  ('f1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'Three-generation paddy family. Bore-well + canal irrigation, natural compost.', 3.2,
   'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80',
   2008, 'ramesh.varma@ybl',
   'Family land for three generations. Bore-well irrigation, mostly natural inputs. Ramesh slow-ages his Sona Masuri for six months before milling — the extra wait shows in the fragrance.',
   'verified', '1234', NOW(), NOW()),

  ('f2000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000002',
   'Switched to direct sales last year. Daughter helps with WhatsApp orders.', 2.5,
   'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&q=80',
   2012, 'saritha@paytm',
   'Switched to direct sales after seeing that mandi middlemen took 30% of her price. Daughter Priyanka helps with WhatsApp orders and photo documentation of each lot.',
   'verified', '5678', NOW(), NOW()),

  ('f3000000-0000-0000-0000-000000000003',
   'b3000000-0000-0000-0000-000000000003',
   'Specialist in long-grain basmati. Ages rice for two seasons before sale.', 6.0,
   'https://images.unsplash.com/photo-1472746729193-26b1b2ebb5ac?w=400&q=80',
   2002, 'nageshwar@upi',
   'Nageshwar has grown basmati for 22 years. He ages each lot in sealed gunny bags for a minimum of one season — the patience shows in the extra-long grain and the deep fragrance.',
   'verified', '9012', NOW(), NOW()),

  ('f4000000-0000-0000-0000-000000000004',
   'b2000000-0000-0000-0000-000000000002',
   'Heirloom red rice grown on family land for 40+ years.', 1.8,
   'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=400&q=80',
   2010, 'lakshmi.devi@ybl',
   'Heirloom red rice variety passed down from her grandmother. The seed has never been hybridised. High iron content, nutty aroma, and a bite that white rice cannot replicate.',
   'verified', '3456', NOW(), NOW()),

  ('f5000000-0000-0000-0000-000000000005',
   'b4000000-0000-0000-0000-000000000004',
   'Aromatic Jeera Samba farmer. Single-pass milling for full fragrance.', 4.5,
   'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&q=80',
   2015, 'vikram@phonepe',
   'Vikram specialises in aromatic short-grain Jeera Samba — prized by Tamil households for pongal and biryani. He single-pass mills within a week of harvest so the fragrance does not fade.',
   'verified', '7890', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  village_id = EXCLUDED.village_id,
  bio = EXCLUDED.bio,
  farm_size_acres = EXCLUDED.farm_size_acres,
  photo_url = EXCLUDED.photo_url,
  farming_since_year = EXCLUDED.farming_since_year,
  upi_id = EXCLUDED.upi_id,
  story = EXCLUDED.story,
  status = EXCLUDED.status,
  aadhaar_last4 = EXCLUDED.aadhaar_last4,
  updated_at = EXCLUDED.updated_at;

-- ── Listings ──────────────────────────────────────────────────────────────────
INSERT INTO public.listings
  (id, farmer_id, title, description, rice_variety, price_per_kg, stock_kg, is_active,
   type, is_organic, harvest_year, harvest_season, is_milled, milled_on,
   pack_sizes, retail_paise, created_at, updated_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'f1000000-0000-0000-0000-000000000001',
   'Ramesh''s Slow-Aged Sona Masuri',
   'Slow-aged six months for a softer cook and a fuller fragrance. Single-pass milled, lightly polished, 0% broken grains. Best for everyday meals — biryani, pulao, plain rice. Grown on black-cotton soil with bore-well irrigation in Konaipalli.',
   'sona_masuri', 5200, 320, true, 'raw', false, 2025, 'rabi', true,
   '2025-05-01 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5500},{"kg":5,"price_per_kg_paise":5300},{"kg":10,"price_per_kg_paise":5200},{"kg":25,"price_per_kg_paise":5000}]',
   8500, NOW(), NOW()),

  ('a2000000-0000-0000-0000-000000000002',
   'f2000000-0000-0000-0000-000000000002',
   'Saritha''s Fresh-Harvest Sona Masuri',
   'Fresh Rabi 2025 harvest from Pochampalli. Well-water irrigated, minimal inputs. Milled within the week of order. Soft, fluffy texture ideal for daily cooking.',
   'sona_masuri', 5300, 140, true, 'raw', false, 2025, 'rabi', true,
   '2025-05-05 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5600},{"kg":5,"price_per_kg_paise":5400},{"kg":10,"price_per_kg_paise":5300},{"kg":25,"price_per_kg_paise":5100}]',
   8500, NOW(), NOW()),

  ('a3000000-0000-0000-0000-000000000003',
   'f1000000-0000-0000-0000-000000000001',
   'Ramesh''s BPT 5204 (Samba)',
   'BPT 5204 — the slim-grained workhorse of the Telangana kitchen. Softens evenly, holds shape in pulao, absorbs rasam perfectly.',
   'bpt_5204', 4900, 200, true, 'raw', false, 2025, 'rabi', true,
   '2025-05-01 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5200},{"kg":5,"price_per_kg_paise":5000},{"kg":10,"price_per_kg_paise":4900},{"kg":25,"price_per_kg_paise":4700}]',
   7500, NOW(), NOW()),

  ('a4000000-0000-0000-0000-000000000004',
   'f2000000-0000-0000-0000-000000000002',
   'Saritha''s BPT 5204 Daily Rice',
   'Fresh harvest BPT 5204 from Pochampalli. Daily-meals workhorse — curd rice, sambar rice, bagara rice. Clean, neutral flavour that carries any curry.',
   'bpt_5204', 4800, 180, true, 'raw', false, 2025, 'rabi', true,
   '2025-05-05 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5100},{"kg":5,"price_per_kg_paise":4900},{"kg":10,"price_per_kg_paise":4800},{"kg":25,"price_per_kg_paise":4600}]',
   7500, NOW(), NOW()),

  ('a5000000-0000-0000-0000-000000000005',
   'f3000000-0000-0000-0000-000000000003',
   'Nageshwar''s 2-Year Aged Basmati',
   'Aged two full seasons in sealed gunny bags at Bhupalpalli. Long, fragrant grain with a dry, separate cook — the standard for dum biryani. Special-occasion rice at an honest farm price.',
   'basmati', 11800, 90, true, 'raw', false, 2023, 'kharif', true,
   '2025-04-15 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":12100},{"kg":5,"price_per_kg_paise":11900},{"kg":10,"price_per_kg_paise":11800},{"kg":25,"price_per_kg_paise":11600}]',
   17500, NOW(), NOW()),

  ('a6000000-0000-0000-0000-000000000006',
   'f3000000-0000-0000-0000-000000000003',
   'Nageshwar''s 1-Year Aged Basmati',
   'One season aged Basmati from Bhupalpalli. Slightly milder fragrance, still exceptional. Gentler price for regular biryani nights.',
   'basmati', 11500, 60, true, 'raw', false, 2024, 'kharif', true,
   '2025-04-15 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":11800},{"kg":5,"price_per_kg_paise":11600},{"kg":10,"price_per_kg_paise":11500},{"kg":25,"price_per_kg_paise":11300}]',
   17500, NOW(), NOW()),

  ('a7000000-0000-0000-0000-000000000007',
   'f5000000-0000-0000-0000-000000000005',
   'Vikram''s Choutuppal Jeera Samba',
   'Aromatic short-grain Jeera Samba from Choutuppal''s mineral-rich well water. Traditional rice for pongal, bisibelebath, and Tamil-style biryani. Single-pass milled within 7 days of harvest.',
   'jeera_samba', 7800, 140, true, 'raw', false, 2025, 'kharif', true,
   '2025-04-20 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":8100},{"kg":5,"price_per_kg_paise":7900},{"kg":10,"price_per_kg_paise":7800},{"kg":25,"price_per_kg_paise":7600}]',
   12000, NOW(), NOW()),

  ('a8000000-0000-0000-0000-000000000008',
   'f4000000-0000-0000-0000-000000000004',
   'Lakshmi''s Heirloom Red Rice',
   'Heirloom red rice grown on the same family plot for over 40 years without hybridisation. Nutty bite, high-fibre bran intact, high iron content — a complete grain.',
   'red_rice', 9000, 60, true, 'raw', false, 2025, 'rabi', true,
   '2025-05-10 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":9300},{"kg":5,"price_per_kg_paise":9100},{"kg":10,"price_per_kg_paise":9000},{"kg":25,"price_per_kg_paise":8800}]',
   14000, NOW(), NOW()),

  ('a9000000-0000-0000-0000-000000000009',
   'f2000000-0000-0000-0000-000000000002',
   'Saritha''s Parboiled Sona Masuri',
   'Parboiled Sona Masuri — pressure-steamed before milling. Stays separate, lower glycemic index. Recommended for diabetic households and anyone wanting a firmer texture.',
   'sona_masuri', 5000, 95, true, 'boiled', false, 2025, 'rabi', true,
   '2025-05-05 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":5300},{"kg":5,"price_per_kg_paise":5100},{"kg":10,"price_per_kg_paise":5000},{"kg":25,"price_per_kg_paise":4800}]',
   8500, NOW(), NOW()),

  ('a0000000-0000-0000-0000-000000000010',
   'f5000000-0000-0000-0000-000000000005',
   'Vikram''s Aged Jeera Samba (2024 Kharif)',
   'Previous kharif lot of Choutuppal Jeera Samba — aged one full season. More concentrated aroma, slightly drier cook. Ideal for those who prefer a less sticky, more separated grain in pongal.',
   'jeera_samba', 7600, 80, true, 'raw', false, 2024, 'kharif', true,
   '2024-12-10 08:00:00+05:30',
   '[{"kg":1,"price_per_kg_paise":7900},{"kg":5,"price_per_kg_paise":7700},{"kg":10,"price_per_kg_paise":7600},{"kg":25,"price_per_kg_paise":7400}]',
   12000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Listing Images ────────────────────────────────────────────────────────────
INSERT INTO public.listing_images (id, listing_id, image_url, is_primary, created_at)
VALUES
  -- L1: Ramesh Sona Masuri
  ('c1100000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',true,NOW()),
  ('c1100000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80',false,NOW()),
  ('c1100000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80',false,NOW()),
  -- L2: Saritha Sona Masuri
  ('c2200000-0000-0000-0000-000000000001','a2000000-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',true,NOW()),
  ('c2200000-0000-0000-0000-000000000002','a2000000-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',false,NOW()),
  -- L3: Ramesh BPT 5204
  ('c3300000-0000-0000-0000-000000000001','a3000000-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80',true,NOW()),
  ('c3300000-0000-0000-0000-000000000002','a3000000-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80',false,NOW()),
  -- L4: Saritha BPT 5204
  ('c4400000-0000-0000-0000-000000000001','a4000000-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',true,NOW()),
  -- L5: Nageshwar Basmati 2yr
  ('c5500000-0000-0000-0000-000000000001','a5000000-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1694839878248-09e44a7dc21e?w=800&q=80',true,NOW()),
  ('c5500000-0000-0000-0000-000000000002','a5000000-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80',false,NOW()),
  ('c5500000-0000-0000-0000-000000000003','a5000000-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80',false,NOW()),
  -- L6: Nageshwar Basmati 1yr
  ('c6600000-0000-0000-0000-000000000001','a6000000-0000-0000-0000-000000000006','https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80',true,NOW()),
  ('c6600000-0000-0000-0000-000000000002','a6000000-0000-0000-0000-000000000006','https://images.unsplash.com/photo-1694839878248-09e44a7dc21e?w=800&q=80',false,NOW()),
  -- L7: Vikram Jeera Samba
  ('c7700000-0000-0000-0000-000000000001','a7000000-0000-0000-0000-000000000007','https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=800&q=80',true,NOW()),
  ('c7700000-0000-0000-0000-000000000002','a7000000-0000-0000-0000-000000000007','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',false,NOW()),
  -- L8: Lakshmi Red Rice
  ('c8800000-0000-0000-0000-000000000001','a8000000-0000-0000-0000-000000000008','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',true,NOW()),
  ('c8800000-0000-0000-0000-000000000002','a8000000-0000-0000-0000-000000000008','https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80',false,NOW()),
  ('c8800000-0000-0000-0000-000000000003','a8000000-0000-0000-0000-000000000008','https://images.unsplash.com/photo-1601050690293-c0ecbe960d97?w=800&q=80',false,NOW()),
  -- L9: Saritha Parboiled
  ('c9900000-0000-0000-0000-000000000001','a9000000-0000-0000-0000-000000000009','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',true,NOW()),
  ('c9900000-0000-0000-0000-000000000002','a9000000-0000-0000-0000-000000000009','https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',false,NOW()),
  -- L10: Vikram Aged Jeera Samba
  ('c0010000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000010','https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=800&q=80',true,NOW()),
  ('c0010000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000010','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',false,NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Mandi Prices (reference data for MandiCompare widget) ─────────────────────
INSERT INTO public.mandi_prices (commodity, market, state, modal_price, date, created_at)
VALUES
  ('rice_paddy',         'Karimnagar APMC',        'Telangana', 2200,  NOW(), NOW()),
  ('rice_paddy',         'Warangal APMC',           'Telangana', 2150,  NOW(), NOW()),
  ('retail_sona_masuri', 'Hyderabad retail (avg)',  'Telangana', 8500,  NOW(), NOW()),
  ('retail_bpt_5204',    'Hyderabad retail (avg)',  'Telangana', 7500,  NOW(), NOW()),
  ('retail_basmati',     'Hyderabad retail (avg)',  'Telangana', 17500, NOW(), NOW()),
  ('retail_red_rice',    'Hyderabad retail (avg)',  'Telangana', 14000, NOW(), NOW()),
  ('retail_jeera_samba', 'Hyderabad retail (avg)',  'Telangana', 12000, NOW(), NOW())
ON CONFLICT DO NOTHING;
