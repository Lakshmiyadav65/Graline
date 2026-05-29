// =====================================================================
// The single import surface for the whole UI: `import { api } from "@/lib/api/client"`.
// No component should ever fetch a URL directly.
//
// USE_MOCK_API gates mock vs real. Defaults to MOCK; INTEGRATION sets
// NEXT_PUBLIC_USE_MOCK_API=false to flip the entire app to the live backend.
// =====================================================================

import { mockApi } from "./mock";
import { realApi } from "./real";
import type { Api } from "./types";

export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export const api: Api = USE_MOCK_API ? mockApi : realApi;

export * from "./types";
