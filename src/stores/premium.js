// Premium + onboarding flag store (mirrors providers premiumServiceRef +
// premiumProvider). Persisted in the kv table.
import { create } from 'zustand';
import { kvGet, kvSet } from '../db';

const K_PREMIUM = 'subtrack.premium';
const K_ONBOARDED = 'subtrack.onboarded';

export const FREE_TIER_LIMIT = 5;

export const usePremiumStore = create((set) => ({
  isPremium: false,
  hasOnboarded: false,
  loaded: false,

  async load() {
    const [prem, onboarded] = await Promise.all([
      kvGet(K_PREMIUM),
      kvGet(K_ONBOARDED),
    ]);
    set({
      isPremium: prem === 'true',
      hasOnboarded: onboarded === 'true',
      loaded: true,
    });
  },

  // Mock purchase (swap for RevenueCat later).
  async purchase() {
    await kvSet(K_PREMIUM, 'true');
    set({ isPremium: true });
  },

  async restore() {
    // mock: status is already local, nothing to fetch
  },

  async finishOnboarding() {
    await kvSet(K_ONBOARDED, 'true');
    set({ hasOnboarded: true });
  },
}));
