// Default-currency store (mirrors providers defaultCurrencyProvider).
import { create } from 'zustand';
import { kvGet, kvSet } from '../db';
import { currencyFromCode, DEFAULT_CURRENCY } from '../models/currency';

const K_CURRENCY = 'subtrack.currency';

export const useCurrencyStore = create((set) => ({
  currency: DEFAULT_CURRENCY,
  loaded: false,

  async load() {
    const code = await kvGet(K_CURRENCY);
    set({ currency: currencyFromCode(code), loaded: true });
  },

  async set(c) {
    await kvSet(K_CURRENCY, c.code);
    set({ currency: c });
  },
}));
