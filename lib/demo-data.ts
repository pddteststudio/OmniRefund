import type { DemoOrder } from "@/types";

export const DEMO_ORDER: DemoOrder = {
  id: "1001",
  customerAddress: "EQC_demo_customer_000000000000000000000000000000000",
  merchantAddress: "EQC_demo_merchant_000000000000000000000000000000000",
  originalSourceToken: "TON",
  originalSourceAmount: "10",
  merchantReceivedToken: "USDT",
  merchantReceivedAmount: "25",
  status: "paid",
  createdAt: "2026-06-08T10:00:00.000Z"
};

export const DEFAULT_REFUND = {
  type: "Partial refund",
  amount: "10",
  fromToken: "USDT",
  toToken: "TON",
  reason: "Order cancelled"
} as const;
