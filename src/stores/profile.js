// Local profile store (display name only — no backend, per product decision).
// Persisted in the kv table alongside premium/onboarding/currency.
import { create } from 'zustand';
import { kvGet, kvSet } from '../db';

const K_PROFILE_NAME = 'subtrack.profileName';

export const useProfileStore = create((set) => ({
  name: '',
  loaded: false,

  async load() {
    const n = await kvGet(K_PROFILE_NAME);
    set({ name: n || '', loaded: true });
  },

  async setName(n) {
    const trimmed = (n || '').trim();
    await kvSet(K_PROFILE_NAME, trimmed);
    set({ name: trimmed });
  },
}));

// "MK" from "Mehmood" -> initials for the avatar.
export function initials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'You';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
