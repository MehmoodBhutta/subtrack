// Mirrors lib/models/sub.dart (Sub class + monthlyCost)
import { categoryFromIndex, categoryIndex, CATEGORIES } from './category';
import { currencyFromCode } from './currency';

// cycle: 'monthly' | 'yearly'
export function createSub({
  id,
  name,
  price,
  cycle,
  nextRenewalDate,
  category,
  currency,
  createdAt,
}) {
  return {
    id,
    name,
    price,
    cycle,
    nextRenewalDate, // ISO string
    category: category || CATEGORIES[3],
    currency: currency || currencyFromCode('PKR'),
    createdAt: createdAt || new Date().toISOString(),
  };
}

// Normalized to a per-month figure so subs of different cycles are comparable.
export function monthlyCost(sub) {
  const p = Number(sub.price) || 0;
  return sub.cycle === 'monthly' ? p : p / 12;
}

export function cycleIndex(cycle) {
  return cycle === 'yearly' ? 1 : 0;
}
export function cycleFromIndex(i) {
  return i === 1 ? 'yearly' : 'monthly';
}

// --- (De)serialization to/from DB rows (ints for enums) ---
export function rowToSub(row) {
  return createSub({
    id: row.id,
    name: row.name,
    price: row.price,
    cycle: cycleFromIndex(row.cycle),
    nextRenewalDate: row.nextRenewalDate,
    category: categoryFromIndex(row.category),
    currency: currencyFromCode(row.currency),
    createdAt: row.createdAt,
  });
}

export function subToRow(sub) {
  return {
    id: sub.id,
    name: sub.name,
    price: Number(sub.price),
    cycle: cycleIndex(sub.cycle),
    nextRenewalDate: sub.nextRenewalDate,
    category: categoryIndex(sub.category),
    currency: sub.currency.code,
    createdAt: sub.createdAt,
  };
}
