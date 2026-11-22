export type Currency = "KES" | "USD";
export interface Price { amount: number; currency: Currency }

const grouping = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/** "KES 25,000" / "USD 250": currency code prefix, thousands grouping, no decimals. */
export function formatPrice(p: Price): string {
  return `${p.currency} ${grouping.format(p.amount)}`;
}
