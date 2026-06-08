"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getReceipt } from "@/lib/storage";
import { formatDateTime, shortAddress } from "@/lib/format";
import type { Receipt } from "@/types";

export function ReceiptCard() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReceipt(getReceipt());
  }, []);

  const receiptText = useMemo(() => {
    if (!receipt) return "";
    return [
      "OmniRefund Receipt",
      `Order ID: #${receipt.orderId}`,
      `Refund ID: ${receipt.refundId}`,
      `Refund type: ${receipt.refundType}`,
      `Reason: ${receipt.reason}`,
      `Refund amount: ${receipt.refundAmount}`,
      `Customer receives: ~${receipt.expectedOutput}`,
      `Recipient: ${receipt.recipientAddress}`,
      `Route: ${receipt.route.join(" → ")} via STON.fi Omniston`,
      `Quote source: STON.fi Omniston Live`,
      `Resolver: ${receipt.resolverName || "n/a"}`,
      `Quote ID: ${receipt.quoteId || "n/a"}`,
      `RFQ ID: ${receipt.rfqId || "n/a"}`,
      `Quote valid until: ${receipt.validUntil ? formatDateTime(receipt.validUntil) : "n/a"}`,
      `Status: ${receipt.status}`,
      `Wallet: ${receipt.walletAddress || "Not connected"}`,
      `Transaction BOC hash: ${receipt.transactionBocHash || "not signed"}`,
      `Created at: ${formatDateTime(receipt.createdAt)}`
    ].join("\n");
  }, [receipt]);

  async function copyReceipt() {
    if (!receiptText) return;
    await navigator.clipboard.writeText(receiptText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (!receipt) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center">
        <h1 className="text-3xl font-black">No receipt yet</h1>
        <p className="mt-3 text-slate-300">Request a live Omniston quote first, then save a quote receipt or sign a real wallet transaction.</p>
        <Link href="/refund" className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-300">
          Create Refund
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-glow backdrop-blur">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Receipt generated</p>
          <h1 className="mt-2 text-4xl font-black">Refund Receipt</h1>
          <p className="mt-3 text-slate-300">
            This receipt is generated from a live STON.fi Omniston quote. If wallet signing was completed, the wallet BOC hash is included.
          </p>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-100">{receipt.status}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Info label="Order ID" value={`#${receipt.orderId}`} />
        <Info label="Refund ID" value={receipt.refundId} />
        <Info label="Refund amount" value={receipt.refundAmount} />
        <Info label="Customer receives" value={`~${receipt.expectedOutput}`} />
        <Info label="Recipient" value={receipt.recipientAddress} />
        <Info label="Route" value={`${receipt.route.join(" → ")} via Omniston`} />
        <Info label="Quote source" value="STON.fi Omniston Live" />
        <Info label="Resolver" value={receipt.resolverName || "n/a"} />
        <Info label="Quote ID" value={receipt.quoteId || "n/a"} />
        <Info label="RFQ ID" value={receipt.rfqId || "n/a"} />
        <Info label="Quote valid until" value={receipt.validUntil ? formatDateTime(receipt.validUntil) : "n/a"} />
        <Info label="Wallet" value={shortAddress(receipt.walletAddress)} />
        <Info label="BOC hash" value={receipt.transactionBocHash || "Not signed"} />
        <Info label="BOC preview" value={receipt.transactionBocPreview || "Not signed"} />
        <Info label="Created" value={formatDateTime(receipt.createdAt)} />
        <Info label="Reason" value={receipt.reason} />
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button onClick={copyReceipt} className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">
          {copied ? "Copied!" : "Copy Receipt"}
        </button>
        <Link href="/dashboard" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15">
          Back to Dashboard
        </Link>
        <Link href="/refund" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15">
          Create Another Refund
        </Link>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-words text-lg font-bold leading-7 text-white">{value}</p>
    </div>
  );
}
