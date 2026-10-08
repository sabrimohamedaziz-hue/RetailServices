export const CURRENCIES = {
  EUR: { symbol: "€", rate: 1, label: "€ EUR" },
  GBP: { symbol: "£", rate: 0.85, label: "£ GBP" },
  USD: { symbol: "$", rate: 1.08, label: "$ USD" },
  CAD: { symbol: "C$", rate: 1.47, label: "C$ CAD" },
  AUD: { symbol: "A$", rate: 1.64, label: "A$ AUD" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const CURRENCY_COOKIE = "cb_currency";

/** Convert a EUR amount to the given currency and format it. */
export function formatMoneyIn(amount: number | string | { toString(): string }, currency: CurrencyCode) {
  const value = Number(amount.toString());
  const { symbol, rate } = CURRENCIES[currency];
  return `${symbol}${(value * rate).toFixed(2)}`;
}
