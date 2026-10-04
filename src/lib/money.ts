const eurFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export function formatMoney(value: number | string | { toString(): string }): string {
  return eurFormatter.format(Number(value.toString()));
}
