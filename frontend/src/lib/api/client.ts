// =====================================================================
// The single import surface for the whole UI: `import { api } from "@/lib/api/client"`.
// No component should ever fetch a URL directly.
//
// USE_MOCK_API gates mock vs real. Defaults to MOCK; INTEGRATION sets
// NEXT_PUBLIC_USE_MOCK_API=false to flip the entire app to the live backend.
// =====================================================================

import { supabaseApi } from "./supabase";
import type { Api } from "./types";

export const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "supabase";

export const api: Api = supabaseApi;

export * from "./types";
