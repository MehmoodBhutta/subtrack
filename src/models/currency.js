// Mirrors lib/models/currency.dart
// Ten explicit currencies (the ones users actually ask for), each with a code,
// symbol, label and decimal count. intl is avoided so the app runs on every
// Expo target without locale-data bundling headaches.

export const CURRENCIES = [
  { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee', fractionDigits: 0 },
  { code: 'USD', symbol: '$', label: 'US Dollar', fractionDigits: 2 },
  { code: 'EUR', symbol: '€', label: 'Euro', fractionDigits: 2 },
  { code: 'GBP', symbol: '£', label: 'British Pound', fractionDigits: 2 },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', fractionDigits: 2 },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham', fractionDigits: 2 },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', fractionDigits: 2 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', fractionDigits: 2 },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', fractionDigits: 0 },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', fractionDigits: 2 },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // PKR

export function currencyFromCode(code) {
  return CURRENCIES.find((c) => c.code === code) || DEFAULT_CURRENCY;
}

// Local static rates relative to PKR for mixing multi-currency totals in the
// Insights views. NOT live FX — just so a USD/EUR sub shows up alongside PKR
// ones. Update these as needed; they're clearly approximate.
export const RATE_TO_PKR = {
  PKR: 1,
  USD: 278,
  EUR: 300,
  GBP: 355,
  INR: 3.3,
  AED: 75,
  CAD: 205,
  AUD: 185,
  JPY: 1.85,
  SGD: 205,
};

// Convert an amount from `from` currency into `to` currency (approx, static).
export function convert(amount, from, to) {
  const f = RATE_TO_PKR[from.code] ?? 1;
  const t = RATE_TO_PKR[to.code] ?? 1;
  return (amount * f) / t;
}

// "$1,100" / "₨1,100" — thousands grouping + symbol, decimals per currency.
export function formatCurrency(amount, currency) {
  const c = currency || DEFAULT_CURRENCY;
  const fixed = amount.toFixed(c.fractionDigits);
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const num = decPart ? `${grouped}.${decPart}` : grouped;
  return `${c.symbol}${num}`;
}
