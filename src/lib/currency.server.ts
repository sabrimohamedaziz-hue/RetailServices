import "server-only";
import { cookies } from "next/headers";
import { CURRENCIES, CURRENCY_COOKIE, type CurrencyCode } from "./currency";

export async function getCurrency(): Promise<CurrencyCode> {
  const store = await cookies();
  const value = store.get(CURRENCY_COOKIE)?.value;
  if (value && value in CURRENCIES) return value as CurrencyCode;
  return "EUR";
}

export { formatMoneyIn } from "./currency";
