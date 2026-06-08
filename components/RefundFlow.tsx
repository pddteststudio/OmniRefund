"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Address } from "@ton/core";
import {
  Blockchain,
  GaslessSettlement,
  SettlementMethod,
  useOmniston,
  useRfq
} from "@ston-fi/omniston-sdk-react";
import { KNOWN_TON_ASSETS, findAsset, mergeAssets, normalizeAsset } from "@/lib/assets";
import { DEMO_ORDER } from "@/lib/demo-data";
import { fromBaseUnits, formatAddress, sha256Text, toBaseUnits } from "@/lib/units";
import { saveReceipt } from "@/lib/storage";
import type { LiveQuoteView, Receipt, TonAsset } from "@/types";
import { RefundTransparencyCard } from "@/components/RefundTransparencyCard";

const DEFAULT_RECIPIENT = "";
const DEFAULT_REASON = "Order cancelled";

export function RefundFlow() {
  const router = useRouter();
  const walletAddress = useTonAddress();
  const [tonConnect] = useTonConnectUI();
  const omniston = useOmniston();

  const [assets, setAssets] = useState<TonAsset[]>(KNOWN_TON_ASSETS);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  const [amount, setAmount] = useState("0.05");
  const [fromAddress, setFromAddress] = useState(KNOWN_TON_ASSETS[0].contractAddress);
  const [toAddress, setToAddress] = useState(KNOWN_TON_ASSETS[1].contractAddress);
  const [recipientAddress, setRecipientAddress] = useState(DEFAULT_RECIPIENT);
  const [slippageBps, setSlippageBps] = useState(50);
  const [requestEnabled, setRequestEnabled] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fromAsset = findAsset(assets, fromAddress) || KNOWN_TON_ASSETS[0];
  const toAsset = findAsset(assets, toAddress) || KNOWN_TON_ASSETS[1];

  useEffect(() => {
    let mounted = true;

    async function loadAssets() {
      setAssetsLoading(true);
      setAssetsError(null);
      try {
        const { StonApiClient, AssetTag } = (await import("@ston-fi/api")) as any;
        const client = new StonApiClient();
        const condition = [AssetTag.LiquidityVeryHigh, AssetTag.LiquidityHigh, AssetTag.LiquidityMedium].filter(Boolean).join(" | ");
        const response = await client.queryAssets({ condition, limit: 80 });
        const rawList = Array.isArray(response) ? response : response?.asset_list || response?.assets || response?.items || [];
        const apiAssets = rawList.map(normalizeAsset).filter(Boolean) as TonAsset[];
        if (mounted) setAssets(mergeAssets(apiAssets));
      } catch (error) {
        if (mounted) {
          setAssets(KNOWN_TON_ASSETS);
          setAssetsError(error instanceof Error ? error.message : "Unable to load STON.fi API assets.");
        }
      } finally {
        if (mounted) setAssetsLoading(false);
      }
    }

    loadAssets();
    return () => {
      mounted = false;
    };
  }, []);

  const bidUnits = useMemo(() => {
    try {
      return toBaseUnits(amount, fromAsset.decimals);
    } catch {
      return "0";
    }
  }, [amount, fromAsset.decimals]);

  const rfqRequest = useMemo(() => {
    return {
      settlementMethods: [SettlementMethod.SETTLEMENT_METHOD_SWAP],
      bidAssetAddress: {
        blockchain: Blockchain.TON,
        address: fromAsset.contractAddress
      },
      askAssetAddress: {
        blockchain: Blockchain.TON,
        address: toAsset.contractAddress
      },
      amount: {
        bidUnits
      },
      settlementParams: {
        gaslessSettlement: GaslessSettlement.GASLESS_SETTLEMENT_POSSIBLE,
        maxPriceSlippageBps: slippageBps,
        maxOutgoingMessages: 4,
        flexibleReferrerFee: true
      }
    };
  }, [bidUnits, fromAsset.contractAddress, slippageBps, toAsset.contractAddress]);

  const quoteEnabled = requestEnabled && bidUnits !== "0" && fromAsset.contractAddress !== toAsset.contractAddress;
  const { data: quoteEvent, isLoading: quoteLoading, error: quoteError } = useRfq(rfqRequest, {
    enabled: quoteEnabled
  });

  const quoteView = useMemo(() => {
    const event = quoteEvent as any;
    if (!event || event.type !== "quoteUpdated" || !event.quote) return null;
    const quote = event.quote;

    const protocolFeeAssetAddress = quote.protocolFeeAsset?.address;
    const protocolFeeDecimals = protocolFeeAssetAddress === toAsset.contractAddress ? toAsset.decimals : fromAsset.decimals;
    const protocolFeeSymbol = protocolFeeAssetAddress === toAsset.contractAddress ? toAsset.symbol : fromAsset.symbol;
    const referrerFeeAssetAddress = quote.referrerFeeAsset?.address;
    const referrerFeeDecimals = referrerFeeAssetAddress === toAsset.contractAddress ? toAsset.decimals : fromAsset.decimals;
    const referrerFeeSymbol = referrerFeeAssetAddress === toAsset.contractAddress ? toAsset.symbol : fromAsset.symbol;

    const view: LiveQuoteView = {
      quoteId: quote.quoteId || `RFQ-${Date.now()}`,
      rfqId: event.rfqId,
      resolverName: quote.resolverName,
      fromSymbol: fromAsset.symbol,
      toSymbol: toAsset.symbol,
      fromAddress: fromAsset.contractAddress,
      toAddress: toAsset.contractAddress,
      inputAmount: `${fromBaseUnits(quote.bidUnits || bidUnits, fromAsset.decimals)} ${fromAsset.symbol}`,
      expectedOutput: `${fromBaseUnits(quote.askUnits, toAsset.decimals)} ${toAsset.symbol}`,
      protocolFee: `${fromBaseUnits(quote.protocolFeeUnits || "0", protocolFeeDecimals)} ${protocolFeeSymbol}`,
      referrerFee: `${fromBaseUnits(quote.referrerFeeUnits || "0", referrerFeeDecimals)} ${referrerFeeSymbol}`,
      slippageBps,
      validUntil: quote.tradeStartDeadline ? new Date(Number(quote.tradeStartDeadline) * 1000).toISOString() : undefined,
      recipientAddress,
      obtainedAt: new Date().toISOString()
    };

    return view;
  }, [bidUnits, fromAsset, quoteEvent, recipientAddress, slippageBps, toAsset]);

  function markInputsChanged() {
    setRequestEnabled(false);
    setFormError(null);
    setTxError(null);
  }

  function validateForm() {
    try {
      toBaseUnits(amount, fromAsset.decimals);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Enter a valid amount.");
    }

    if (fromAsset.contractAddress === toAsset.contractAddress) {
      throw new Error("Choose two different tokens for an Omniston route.");
    }

    try {
      Address.parse(recipientAddress.trim());
    } catch {
      throw new Error("Enter a valid TON recipient address.");
    }
  }

  function requestLiveQuote() {
    try {
      validateForm();
      setFormError(null);
      setTxError(null);
      setRequestEnabled(true);
    } catch (error) {
      setRequestEnabled(false);
      setFormError(error instanceof Error ? error.message : "Unable to request quote.");
    }
  }

  function useConnectedWalletAsRecipient() {
    if (!walletAddress) {
      setFormError("Connect a wallet first, or paste the customer recipient address manually.");
      return;
    }
    setRecipientAddress(walletAddress);
    markInputsChanged();
  }

  async function saveQuoteReceipt(status: Receipt["status"], boc?: string) {
    if (!quoteView) return;
    const transactionBocHash = boc ? await sha256Text(boc) : undefined;
    const receipt: Receipt = {
      orderId: DEMO_ORDER.id,
      refundId: `RF-${quoteView.quoteId.slice(0, 8).toUpperCase()}`,
      refundType: "Partial refund",
      reason: DEFAULT_REASON,
      refundAmount: quoteView.inputAmount,
      refundToken: quoteView.fromSymbol,
      expectedOutput: quoteView.expectedOutput,
      outputToken: quoteView.toSymbol,
      route: [quoteView.fromSymbol, quoteView.toSymbol],
      quoteSource: "omniston_live",
      quoteId: quoteView.quoteId,
      rfqId: quoteView.rfqId,
      resolverName: quoteView.resolverName,
      validUntil: quoteView.validUntil,
      status,
      walletAddress: walletAddress || undefined,
      recipientAddress: quoteView.recipientAddress,
      transactionBocHash,
      transactionBocPreview: boc ? `${boc.slice(0, 24)}...${boc.slice(-16)}` : undefined,
      createdAt: new Date().toISOString()
    };
    saveReceipt(receipt);
    router.push("/success");
  }

  async function saveQuoteOnlyReceipt() {
    if (!quoteView) return;
    await saveQuoteReceipt("Quote created");
  }

  async function buildAndSendRealRefundSwap() {
    setTxError(null);

    if (!walletAddress) {
      setTxError("Connect the merchant wallet first.");
      return;
    }

    const event = quoteEvent as any;
    if (!event || event.type !== "quoteUpdated" || !event.quote) {
      setTxError("Request a live Omniston quote first.");
      return;
    }

    try {
      validateForm();
      setIsSending(true);

      const tx = await omniston.buildTransfer({
        quote: event.quote,
        sourceAddress: {
          blockchain: Blockchain.TON,
          address: walletAddress
        },
        destinationAddress: {
          blockchain: Blockchain.TON,
          address: recipientAddress.trim()
        },
        gasExcessAddress: {
          blockchain: Blockchain.TON,
          address: walletAddress
        },
        refundAddress: {
          blockchain: Blockchain.TON,
          address: walletAddress
        },
        useRecommendedSlippage: true
      } as any);

      const messages = (tx as any).ton?.messages || [];
      if (!messages.length) throw new Error("Omniston did not return TON transaction messages.");

      const result = await tonConnect.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 10 * 60,
        messages: messages.map((message: any) => ({
          address: String(message.targetAddress || message.address),
          amount: String(message.sendAmount || message.amount || "0"),
          payload: message.payload
        }))
      });

      await saveQuoteReceipt("Wallet signed", result.boc);
    } catch (error) {
      setTxError(error instanceof Error ? error.message : "Unable to build or send Omniston transaction.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Reference order</p>
          <h1 className="mt-2 text-3xl font-black">Order #{DEMO_ORDER.id}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This order is only context for the refund use case. The form below uses your real amount, real recipient and live Omniston RFQ.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <Row label="Original payment" value="10 TON" />
            <Row label="Merchant received" value="25 USDT" />
            <Row label="Original route" value="TON → USDT" />
            <Row label="Status" value="Paid" />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Refund form</p>
          <h2 className="mt-2 text-2xl font-black">Create real Omniston refund quote</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Enter the real refund amount and customer wallet. The quote below comes from STON.fi Omniston v1beta8, not from a static rate.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400">Refund amount</span>
              <input
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  markInputsChanged();
                }}
                inputMode="decimal"
                placeholder="0.05"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-bold text-white outline-none transition focus:border-cyan-300/60"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <AssetSelect
                label="Refund from"
                assets={assets}
                value={fromAddress}
                onChange={(value) => {
                  setFromAddress(value);
                  markInputsChanged();
                }}
              />
              <AssetSelect
                label="Customer receives"
                assets={assets}
                value={toAddress}
                onChange={(value) => {
                  setToAddress(value);
                  markInputsChanged();
                }}
              />
            </div>

            <label className="block">
              <span className="text-sm text-slate-400">Customer recipient address</span>
              <textarea
                value={recipientAddress}
                onChange={(event) => {
                  setRecipientAddress(event.target.value);
                  markInputsChanged();
                }}
                placeholder="Paste customer TON wallet address"
                rows={3}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-bold text-white outline-none transition focus:border-cyan-300/60"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={useConnectedWalletAsRecipient}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-cyan-100 transition hover:border-cyan-300/50"
              >
                Use connected wallet as recipient
              </button>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-300">
                Slippage: <strong className="text-white">{slippageBps / 100}%</strong>
              </div>
            </div>

            <label className="block">
              <span className="text-sm text-slate-400">Slippage limit, bps</span>
              <input
                type="number"
                min={0}
                max={1000}
                value={slippageBps}
                onChange={(event) => {
                  setSlippageBps(Number(event.target.value));
                  markInputsChanged();
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-bold text-white outline-none transition focus:border-cyan-300/60"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={requestLiveQuote}
            disabled={quoteLoading}
            className="mt-6 w-full rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {quoteLoading ? "Waiting for Omniston RFQ..." : "Get Live Omniston Quote"}
          </button>

          {assetsLoading && <p className="mt-4 text-sm text-slate-400">Loading token list from STON.fi API...</p>}
          {assetsError && (
            <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm text-yellow-100">
              STON.fi API token list error, using known TON/USDT/STON addresses: {assetsError}
            </p>
          )}
          {formError && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{formError}</p>}
          {requestEnabled && quoteError && (
            <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">
              Live Omniston RFQ failed: {String((quoteError as any)?.message || quoteError)}
            </p>
          )}
        </section>
      </aside>

      <section className="space-y-6">
        <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-950/20 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">STON.fi Omniston v1beta8 RFQ</p>
              <h2 className="mt-2 text-3xl font-black">
                {quoteView ? `${quoteView.inputAmount} → ${quoteView.expectedOutput}` : "No live quote yet"}
              </h2>
              <p className="mt-2 text-slate-300">
                {quoteView ? "Live quote received from Omniston resolver." : "Fill the refund form and request a real RFQ."}
              </p>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-black ${quoteView ? "bg-emerald-400/15 text-emerald-100" : "bg-white/10 text-slate-300"}`}>
              {quoteView ? "Live Omniston" : "Waiting"}
            </span>
          </div>

          {quoteLoading && <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-slate-200">Requesting quote from Omniston WebSocket stream...</p>}

          {quoteView && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Route" value={`${quoteView.fromSymbol} → ${quoteView.toSymbol}`} />
              <Info label="Expected output" value={quoteView.expectedOutput} />
              <Info label="Resolver" value={quoteView.resolverName || "Omniston resolver"} />
              <Info label="Quote ID" value={quoteView.quoteId} />
              <Info label="RFQ ID" value={quoteView.rfqId || "Received"} />
              <Info label="Protocol fee" value={quoteView.protocolFee} />
              <Info label="Referrer fee" value={quoteView.referrerFee} />
              <Info label="Valid until" value={quoteView.validUntil ? new Date(quoteView.validUntil).toLocaleString("en-US") : "Omniston deadline"} />
              <Info label="Recipient" value={formatAddress(quoteView.recipientAddress, 10, 8)} />
              <Info label="Obtained" value={new Date(quoteView.obtainedAt).toLocaleTimeString("en-US")} />
            </div>
          )}
        </section>

        <RefundTransparencyCard />

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">TON Connect wallet</p>
          <h2 className="mt-2 text-2xl font-black">Connect merchant wallet</h2>
          <p className="mt-3 text-slate-300">
            The real refund swap is signed by the connected wallet. The app never holds funds or private keys.
          </p>
          <div className="mt-5">
            <TonConnectButton />
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm text-slate-400">Connected wallet</p>
            <p className="mt-1 break-all text-lg font-black">{walletAddress || "Not connected"}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Receipt and signing</p>
          <h2 className="mt-2 text-2xl font-black">Create receipt from live quote</h2>
          <p className="mt-3 text-slate-300">
            Save a quote receipt for review, or build the real Omniston transaction and open it in the connected wallet.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={saveQuoteOnlyReceipt}
              disabled={!quoteView}
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 font-black text-cyan-100 transition hover:border-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Live Quote Receipt
            </button>
            <button
              type="button"
              onClick={buildAndSendRealRefundSwap}
              disabled={!quoteView || !walletAddress || isSending}
              className="rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? "Opening wallet..." : "Build & Sign Real Refund Swap"}
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-yellow-100/90">
            The second button can move real funds if the wallet signs. Use a small amount and make sure the connected wallet owns the selected refund token.
          </p>
          {txError && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{txError}</p>}
        </section>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-all text-lg font-black text-white">{value}</p>
    </div>
  );
}

function AssetSelect({ label, assets, value, onChange }: { label: string; assets: TonAsset[]; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-bold text-white outline-none transition focus:border-cyan-300/60"
      >
        {assets.map((asset) => (
          <option key={asset.contractAddress} value={asset.contractAddress}>
            {asset.symbol} — {asset.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
