import { NextResponse } from "next/server";
import { getRefundQuote } from "@/lib/omniston";
import type { QuoteRequest } from "@/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<QuoteRequest>;
    const quoteRequest: QuoteRequest = {
      fromToken: body.fromToken === "TON" ? "TON" : "USDT",
      toToken: body.toToken === "USDT" ? "USDT" : "TON",
      amount: body.amount || "10",
      recipientAddress: body.recipientAddress || "EQC_demo_customer_000000000000000000000000000000000",
      slippageBps: body.slippageBps ?? 30
    };

    const quote = await getRefundQuote(quoteRequest);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to get quote."
      },
      { status: 400 }
    );
  }
}
