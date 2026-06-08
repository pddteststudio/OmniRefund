export type TokenSymbol = string;

export type TonAsset = {
  symbol: string;
  displayName: string;
  contractAddress: string;
  decimals: number;
  imageUrl?: string;
  source: "ston_api" | "known_default";
};

export type LiveQuoteView = {
  quoteId: string;
  rfqId?: string;
  resolverName?: string;
  fromSymbol: string;
  toSymbol: string;
  fromAddress: string;
  toAddress: string;
  inputAmount: string;
  expectedOutput: string;
  protocolFee: string;
  referrerFee: string;
  slippageBps: number;
  validUntil?: string;
  recipientAddress: string;
  obtainedAt: string;
};

export type DemoOrder = {
  id: string;
  customerAddress: string;
  merchantAddress: string;
  originalSourceToken: "TON";
  originalSourceAmount: string;
  merchantReceivedToken: "USDT";
  merchantReceivedAmount: string;
  status: "paid";
  createdAt: string;
};

export type ReceiptStatus = "Quote created" | "Wallet signed" | "Wallet rejected";

export type Receipt = {
  orderId: string;
  refundId: string;
  refundType: "Partial refund";
  reason: string;
  refundAmount: string;
  refundToken: string;
  expectedOutput: string;
  outputToken: string;
  route: string[];
  quoteSource: "omniston_live";
  quoteId?: string;
  rfqId?: string;
  resolverName?: string;
  validUntil?: string;
  status: ReceiptStatus;
  walletAddress?: string;
  recipientAddress: string;
  transactionBocHash?: string;
  transactionBocPreview?: string;
  createdAt: string;
};
