import type { Quote, QuoteRequest, QuoteResponse, TokenSymbol } from "@/types";
import { fromUnits, toUnits } from "@/lib/format";
import { getSafeDemoQuote } from "@/lib/safe-demo";

const TOKEN_DECIMALS: Record<TokenSymbol, number> = {
  TON: 9,
  USDT: 6
};

const TOKEN_ADDRESSES: Record<TokenSymbol, string> = {
  // Native TON placeholder used by TON ecosystem integrations for native TON routing.
  TON: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
  // TON USDT jetton master address used in STON.fi / Omniston integration examples.
  USDT: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
};

function validateQuoteInput(input: QuoteRequest) {
  if (!input.fromToken || !input.toToken) throw new Error("Token pair is required.");
  if (!(input.fromToken in TOKEN_DECIMALS)) throw new Error("Unsupported fromToken.");
  if (!(input.toToken in TOKEN_DECIMALS)) throw new Error("Unsupported toToken.");

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Refund amount must be greater than 0.");
  if (!input.recipientAddress || input.recipientAddress.length < 12) throw new Error("Recipient address is required.");
}

export async function getRefundQuote(input: QuoteRequest): Promise<QuoteResponse> {
  validateQuoteInput(input);

  const liveEnabled = process.env.OMNISTON_LIVE_ENABLED !== "false";
  const safeModeEnabled = process.env.OMNISTON_SAFE_DEMO_MODE !== "false";

  if (!liveEnabled) {
    if (!safeModeEnabled) throw new Error("Live Omniston quote is disabled and Safe Demo Mode is off.");
    return {
      success: true,
      source: "safe_demo",
      quote: getSafeDemoQuote(input),
      warning: "Live Omniston RFQ is disabled by environment. Safe Demo quote is shown only as fallback."
    };
  }

  try {
    const liveQuote = await getLiveOmnistonQuote(input);
    return {
      success: true,
      source: "omniston_live",
      quote: liveQuote
    };
  } catch (error) {
    if (!safeModeEnabled) throw error;

    return {
      success: true,
      source: "safe_demo",
      quote: getSafeDemoQuote(input),
      warning: `Live Omniston RFQ failed, so the app switched to Safe Demo fallback: ${error instanceof Error ? error.message : "unknown error"}`
    };
  }
}

async function getLiveOmnistonQuote(input: QuoteRequest): Promise<Quote> {
  const sdk = (await import("@ston-fi/omniston-sdk")) as any;
  const omniston = new sdk.Omniston({
    apiUrl: process.env.OMNISTON_API_URL || "wss://omni-ws.ston.fi"
  });

  const observable = omniston.requestForQuote({
    settlementMethods: [sdk.SettlementMethod.SETTLEMENT_METHOD_SWAP],
    askAssetAddress: {
      blockchain: sdk.Blockchain.TON,
      address: TOKEN_ADDRESSES[input.toToken]
    },
    bidAssetAddress: {
      blockchain: sdk.Blockchain.TON,
      address: TOKEN_ADDRESSES[input.fromToken]
    },
    amount: {
      bidUnits: toUnits(input.amount, TOKEN_DECIMALS[input.fromToken])
    },
    settlementParams: {
      maxPriceSlippageBps: input.slippageBps ?? 50,
      gaslessSettlement: sdk.GaslessSettlement?.GASLESS_SETTLEMENT_POSSIBLE,
      maxOutgoingMessages: 4,
      flexibleReferrerFee: true
    }
  });

  const quoteEvent = await waitForFirstQuote(observable, Number(process.env.OMNISTON_QUOTE_TIMEOUT_MS || 12000));
  const quote = quoteEvent.quote;

  const expectedOutput = fromUnits(String(quote.askUnits), TOKEN_DECIMALS[input.toToken], input.toToken === "TON" ? 6 : 2);
  const protocolFeeUnits = quote.protocolFeeUnits ? String(quote.protocolFeeUnits) : "0";
  const feeToken = quote.protocolFeeAsset?.address === TOKEN_ADDRESSES.TON ? "TON" : input.fromToken;
  const fee = fromUnits(protocolFeeUnits, TOKEN_DECIMALS[feeToken], feeToken === "TON" ? 6 : 2);
  const validUntil = quote.tradeStartDeadline ? new Date(Number(quote.tradeStartDeadline) * 1000).toISOString() : undefined;

  return {
    quoteId: quote.quoteId || quoteEvent.rfqId || `OMNI-${Date.now()}`,
    rfqId: quoteEvent.rfqId,
    resolverName: quote.resolverName,
    fromToken: input.fromToken,
    toToken: input.toToken,
    inputAmount: input.amount,
    expectedOutput,
    minOutput: expectedOutput,
    slippage: String((input.slippageBps ?? 50) / 100),
    fee,
    route: [input.fromToken, input.toToken],
    source: "omniston_live",
    recipientAddress: input.recipientAddress,
    validUntil,
    obtainedAt: new Date().toISOString()
  };
}

function waitForFirstQuote(observable: any, timeoutMs: number): Promise<any> {
  return new Promise((resolve, reject) => {
    let subscription: any;
    let latestRfqId: string | undefined;

    const timer = setTimeout(() => {
      try {
        subscription?.unsubscribe?.();
      } catch {}
      reject(new Error("Omniston quote timeout."));
    }, timeoutMs);

    subscription = observable.subscribe({
      next: (event: any) => {
        if (event?.type === "ack" && event.rfqId) {
          latestRfqId = event.rfqId;
        }

        if (event?.type === "quoteUpdated" && event.quote) {
          clearTimeout(timer);
          try {
            subscription?.unsubscribe?.();
          } catch {}
          resolve({ ...event, rfqId: event.rfqId || latestRfqId });
        }

        if (event?.type === "noQuote") {
          clearTimeout(timer);
          try {
            subscription?.unsubscribe?.();
          } catch {}
          reject(new Error("Omniston returned no quote for this token pair and amount."));
        }
      },
      error: (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
      complete: () => {
        clearTimeout(timer);
        reject(new Error("Omniston quote stream completed before a quote was received."));
      }
    });
  });
}
