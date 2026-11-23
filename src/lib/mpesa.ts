/** How clients pay by M-Pesa once a quote is agreed. Melvine supplies the details in src/lib/site.ts. */
export type MpesaPayment = { kind: "till" | "paybill" | "send-money"; number: string; account?: string; name?: string };

/** Label/value lines to display. Incomplete details throw at build time rather than showing a broken instruction. */
export function mpesaLines(p: MpesaPayment): { label: string; value: string }[] {
  switch (p.kind) {
    case "till":
      return [{ label: "Till number", value: p.number }];
    case "paybill":
      if (!p.account) throw new Error("M-Pesa paybill needs an account number");
      return [{ label: "Paybill", value: p.number }, { label: "Account", value: p.account }];
    case "send-money":
      if (!p.name) throw new Error("M-Pesa Send Money needs the registered name");
      return [{ label: "Send Money to", value: p.number }, { label: "Name", value: p.name }];
  }
}
