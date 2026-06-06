# Grainline — Build Journal

Append-only progress log for the frontend-first gated build (M2–M6).
`✅` = phase passed its gate (typecheck + lint + done-criteria). `⛔` = halt.

Strategy: FRONTEND track (against typed mock API) → BACKEND track → INTEGRATION.

---

[2026-05-06 IST] BUILD START  repo=grainline strategy=frontend-first
[2026-05-06 IST] NOTE         M1 already shipped (design system, layout shell, home stub, /sell, enroll placeholder, 404). No API routes yet.
[2026-05-06 IST] PHASE START  FE-SETUP  typed mock API layer
[2026-05-06 IST] NOTE         lib/api/{types,mock,real,client}.ts — full Api contract, seed-derived fixtures (8 villages/12 farmers/18 listings), latency + forceError control, USE_MOCK_API flag (defaults mock).
[2026-05-06 IST] GATE         FE-SETUP  typecheck=pass lint=pass criteria=pass  ✅
[2026-05-06 IST] PHASE START  FE-M2  auth UI (/login OTP, session TopBar, route guards)
[2026-05-06 IST] NOTE         SessionProvider + Providers wired into root layout; /login 2-step OTP (rhf+zod phone, OtpInput 6-box paste-friendly); mock session persists to localStorage; TopBar session-aware (account dropdown, role home, sign out, buyer-only Sell/Cart).
[2026-05-06 IST] NOTE         RequireRole guard built; applied to /orders, /farmer-app, /admin as those segments land in FE-M4/M5/M6 (deviation: no protected route exists yet to attach it to in M2).
[2026-05-06 IST] GATE         FE-M2  typecheck=pass lint=pass criteria=pass  ✅
[2026-05-06 IST] PHASE START  FE-M3  catalogue & cart
[2026-05-06 IST] NOTE         Cart store (zustand+persist, hydration-safe useCartCount wired to TopBar badge). Components: SectionHead, ListingCard, VillageCard, FarmerCard, MandiCompareCard, PriceBlock, PackPicker, SampleBanner, FilterBar, ListingActions. Shared lib/labels.ts (variety names + per-variety gradients).
[2026-05-06 IST] NOTE         Pages: full home (featured+villages+how strip), /browse (filters via searchParams + FilterBar URL sync + empty state), /listing/[id] (404 if not active, pack picker, add-to-cart, sample), /villages, /villages/[slug], /how-it-works. Catalogue pages are Server Components calling api directly (INT note: realApi needs absolute base URL for server-side fetch).
[2026-05-06 IST] GATE         FE-M3  typecheck=pass lint=pass criteria=pass(8 routes 200/404 w/ content)  ✅
[2026-05-06 IST] CHECKPOINT   FE-SETUP+FE-M2+FE-M3 green. Remaining: FE-M4, FE-M5, FE-M6, FRONTEND GATE, BACKEND track, INTEGRATION.
[2026-05-06 IST] PHASE START  FE-M4  cart, checkout, orders
[2026-05-06 IST] NOTE         lib/pricing.ts shared fee/commission helpers (mock refactored to use them — no drift). Components: CartLine (qty stepper), ShipOpt, StatusTimeline (cancelled/disputed handled), RazorpayMock (success/failure/dismiss paths).
[2026-05-06 IST] NOTE         Pages: /cart (hydration-safe, empty state), /checkout (RequireRole customer, fulfillment+payment tiles, address prefill+zod validate, live fee/total, COD vs Razorpay-mock paths, failed/dismissed keeps cart), /orders + /orders/[orderNumber] (RequireRole, StatusTimeline, item + delivery + payment detail). Pill exports PillTone; labels.ts adds ORDER_STATUS_LABEL + orderStatusTone.
[2026-05-06 IST] GATE         FE-M4  typecheck=pass lint=pass build=pass(13 routes)  ✅
[2026-05-06 IST] CHECKPOINT   Customer journey complete on mock: browse → listing → cart → checkout (UPI/card/COD) → tracking. Remaining: FE-M5, FE-M6, FRONTEND GATE, BACKEND, INTEGRATION.
[2026-05-06 IST] PHASE START  FE-M5  farmer enrollment + dashboard
[2026-05-06 IST] NOTE         FarmerDashboard contract extended (weekly_earnings + recent_payouts) + mock updated. Components: KPICard, OrderRow.
[2026-05-06 IST] NOTE         /sell/enroll = real 5-step wizard (phone OTP → about+photo+village-or-request → payout → first listing → review), localStorage-persisted (resumable), per-step validation, final farmerEnrollInputSchema parse. /farmer-app shell (RequireRole farmer + aside nav) + dashboard (KPIs, incoming orders, pickup reminder ⌖, pending-verification banner) + /earnings (recharts weekly bar + payouts) + /listings + /listings/new (createListing).
[2026-05-06 IST] GATE         FE-M5  typecheck=pass lint=pass criteria=pass(routes 200; enroll resumable)  ✅
[2026-05-06 IST] CHECKPOINT   All 3 core journeys demoable on mock: purchase, sample, farmer-enroll. Remaining: FE-M6 (admin), FRONTEND GATE, BACKEND, INTEGRATION.
[2026-05-06 IST] PHASE START  FE-M6  admin console
[2026-05-06 IST] NOTE         /admin shell (RequireRole admin + aside nav) + dashboard (8 KPIs + pending actions). /admin/verify (farmer+village queues, verify/decline). /admin/route (generate draft, pickups grouped by village + deliveries, inline QCForm per farmer-order with reject→cancel, Confirm & notify). /admin/payouts (batch, Process all → RazorpayX mock). /admin/mandi (list + add). components/admin/QCForm.
[2026-05-06 IST] GATE         FE-M6  typecheck=pass lint=pass criteria=pass(5 admin routes 200; weekly cycle walkable)  ✅
[2026-05-06 IST] GATE         FRONTEND  typecheck=pass lint=pass build=pass(22 routes) 3-core-journeys+admin-cycle on mock  ✅✅
[2026-05-06 IST] MILESTONE    FRONTEND TRACK COMPLETE. Next: BACKEND track (BE-SETUP..BE-M6) — REQUIRES Postgres + service creds (MSG91/Razorpay/Cloudinary/Upstash) to fully exercise. Then INTEGRATION (flip USE_MOCK_API=false).
