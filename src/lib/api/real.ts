// =====================================================================
// Real API adapter — fetch wrappers over /api/* route handlers.
// Implements the same Api contract as the mock. The BACKEND track builds
// the matching routes; INTEGRATION flips USE_MOCK_API to start using this.
// =====================================================================

import type { Api, ApiResult } from "./types";

async function req<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { ok: false, error: { code: "INTERNAL", message: "Network error. Check your connection." } };
  }
}

function qs(params: Record<string, unknown>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

export const realApi: Api = {
  auth: {
    requestOtp: (phone) => req("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }),
    verifyOtp: (r) => req("/auth/verify-otp", { method: "POST", body: JSON.stringify(r) }),
    session: () => req("/auth/session"),
    logout: () => req("/auth/logout", { method: "POST" }),
  },
  listings: {
    list: (filters = {}) => req(`/listings${qs(filters as Record<string, unknown>)}`),
    get: (id) => req(`/listings/${encodeURIComponent(id)}`),
    featured: (n = 3) => req(`/listings/featured${qs({ n })}`),
  },
  villages: {
    list: () => req("/villages"),
    get: (slug) => req(`/villages/${encodeURIComponent(slug)}`),
  },
  mandi: {
    compare: (variety) => req(`/mandi/compare${qs({ variety })}`),
  },
  orders: {
    create: (r) => req("/orders", { method: "POST", body: JSON.stringify(r) }),
    verifyPayment: (r) => req("/payments/razorpay/verify", { method: "POST", body: JSON.stringify(r) }),
    list: () => req("/orders"),
    get: (orderNumber) => req(`/orders/${encodeURIComponent(orderNumber)}`),
  },
  samples: {
    create: (r) => req("/samples", { method: "POST", body: JSON.stringify(r) }),
  },
  customer: {
    profile: () => req("/customer/profile"),
    addAddress: (addr) => req("/customer/addresses", { method: "POST", body: JSON.stringify(addr) }),
  },
  farmer: {
    enroll: (r) => req("/farmers/enroll", { method: "POST", body: JSON.stringify(r) }),
    me: () => req("/farmers/me"),
    listings: () => req("/farmers/me/listings"),
    createListing: (input) => req("/farmers/me/listings", { method: "POST", body: JSON.stringify(input) }),
    updateListing: (id, input) => req(`/farmers/me/listings/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) }),
    orderAction: (orderNumber, action) => req(`/farmers/me/orders/${encodeURIComponent(orderNumber)}/action`, { method: "POST", body: JSON.stringify({ action }) }),
  },
  admin: {
    kpis: () => req("/admin/kpis"),
    pendingFarmers: () => req("/admin/verify/farmers"),
    pendingVillages: () => req("/admin/verify/villages"),
    verifyFarmer: (id, approve, reason) => req(`/admin/verify/farmers/${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify({ approve, reason }) }),
    verifyVillage: (id, approve, reason) => req(`/admin/verify/villages/${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify({ approve, reason }) }),
    routePlans: () => req("/admin/route-plans"),
    routePlan: (week) => req(`/admin/route-plans/${encodeURIComponent(week)}`),
    generateRoutePlan: () => req("/admin/route-plans/generate", { method: "POST" }),
    confirmRoutePlan: (week) => req(`/admin/route-plans/${encodeURIComponent(week)}/confirm`, { method: "POST" }),
    logQc: (input) => req("/admin/qc", { method: "POST", body: JSON.stringify(input) }),
    payoutBatch: (week) => req(`/admin/payouts/${encodeURIComponent(week)}`),
    runPayouts: (week) => req(`/admin/payouts/${encodeURIComponent(week)}/run`, { method: "POST" }),
    mandiPrices: () => req("/admin/mandi-prices"),
    addMandiPrice: (row) => req("/admin/mandi-prices", { method: "POST", body: JSON.stringify(row) }),
  },
};
