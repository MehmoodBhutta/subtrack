// Mirrors lib/models/sub.dart (Category enum + CategoryMeta)
// Keep indices stable — they are persisted in the DB as integers.

export const CATEGORIES = [
  { name: 'streaming', label: 'Streaming', color: '#6A5AE0' }, // brand indigo
  { name: 'software', label: 'Software', color: '#0EA5E9' }, // sky
  { name: 'fitness', label: 'Fitness', color: '#10B981' }, // emerald
  { name: 'other', label: 'Other', color: '#F59E0B' }, // amber
];

export function categoryFromIndex(i) {
  return CATEGORIES[i] || CATEGORIES[3];
}

export function categoryIndex(cat) {
  const i = CATEGORIES.findIndex((c) => c.name === (cat && cat.name));
  return i < 0 ? 3 : i;
}
