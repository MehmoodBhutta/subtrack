// Subscriptions store (mirrors providers SubscriptionsNotifier). Keeps the
// local DB and scheduled notifications in sync on every mutation.
import { create } from 'zustand';
import { allSubs, upsertSub, deleteSub, clearAll } from '../db';
import { createSub, monthlyCost } from '../models/sub';
import { convert } from '../models/currency';
import { uuid } from '../utils/format';
import * as notes from '../services/notifications';

export const useSubsStore = create((set, get) => ({
  subs: [],
  loading: true,
  error: null,

  async load() {
    try {
      const subs = await allSubs();
      set({ subs, loading: false, error: null });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  async add({ name, price, cycle, nextRenewalDate, category, currency }) {
    const sub = createSub({
      id: uuid(),
      name,
      price,
      cycle,
      nextRenewalDate,
      category,
      currency,
    });
    await upsertSub(sub);
    await notes.scheduleFor(sub);
    await get().load();
    return sub;
  },

  async save(sub) {
    await upsertSub(sub);
    await notes.cancelFor(sub.id);
    await notes.scheduleFor(sub);
    await get().load();
  },

  async remove(id) {
    await deleteSub(id);
    await notes.cancelFor(id);
    await get().load();
  },

  async clearAll() {
    await clearAll();
    await notes.cancelAll();
    await get().load();
  },
}));

// Derived helpers (call outside render or with useMemo).
export function totalMonthly(subs, currency) {
  // Sum every subscription converted into the default currency (approx static
  // rates) so mixed-currency subs (e.g. a USD sub) are included.
  return subs.reduce((s, x) => s + convert(monthlyCost(x), x.currency, currency), 0);
}

export function monthlyByOtherCurrencies(subs, currency) {
  const others = {};
  for (const x of subs) {
    if (x.currency.code !== currency.code) {
      others[x.currency.code] = (others[x.currency.code] || 0) + monthlyCost(x);
    }
  }
  return others;
}
