"use client";

import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export type MobileState = {
  authed: boolean;
  profileDone: boolean;
};

let cachedState: MobileState | null = null;
let cachePromise: Promise<MobileState> | null = null;

export async function getMobileState(forceRefresh = false): Promise<MobileState> {
  if (!forceRefresh && cachedState) return cachedState;
  if (!forceRefresh && cachePromise) return cachePromise;

  cachePromise = (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      cachedState = { authed: false, profileDone: false };
      return cachedState;
    }

    try {
      const profile = await api.getProfile();
      cachedState = { authed: true, profileDone: Boolean(profile) };
      return cachedState;
    } catch {
      cachedState = { authed: false, profileDone: false };
      return cachedState;
    }
  })();

  return cachePromise;
}

export function clearMobileStateCache() {
  cachedState = null;
  cachePromise = null;
}
