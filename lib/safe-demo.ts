import type { Quote, QuoteRequest, TokenSymbol } from "@/types";

const DEMO_RATES: Record<`${TokenSymbol}_${TokenSymbol}`, number> = {
  USDT_TON: 0.394,
  TON_USDT: 2.54,
  USDT_USDT: 1,
  TON_TON: 1
};

export function getSafeDemoQuote(input: QuoteRequest): Quote {
  const pair = `${input.fromToken}_${input.toToken}` as const;
  const rate = DEMO_RATES[pair] ?? 1;
  const amount = Number(input.amount);
  const expectedOutput = Number.isFinite(amount) ? (amount * rate).toFixed(input.toToken === "TON" ? 4 : 2) : "0";
  const fee = input.fromToken === "USDT" ? "0.02" : "0.004";

  return {
    quoteId: `SAFE-${Date.now()}`,
    resolverName: "Safe Demo fallback",
    fromToken: input.fromToken,
    toToken: input.toToken,
    inputAmount: input.amount,
    expectedOutput,
    minOutput: (Number(expectedOutput) * 0.997).toFixed(input.toToken === "TON" ? 4 : 2),
    slippage: "0.3",
    fee,
    route: [input.fromToken, input.toToken],
    source: "safe_demo",
    recipientAddress: input.recipientAddress,
    validUntil: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
    obtainedAt: new Date().toISOString()
  };
}
