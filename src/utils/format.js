// Small shared formatting + id helpers.
export function formatDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
  const y = dt.getFullYear();
  return `${m}/${day}/${y}`;
}

export function uuid() {
  // Available in Hermes (modern) and all RN 0.7x+ runtimes.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
