"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTonAddress } from "@tonconnect/ui-react";
import { DEMO_ORDER } from "@/lib/demo-data";
import { clearReceipts, getReceipts } from "@/lib/storage";
import { formatDateTime, shortAddress } from "@/lib/format";
import type { Receipt } from "@/types";

export function DashboardClient() {
  const walletAddress = useTonAddress();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setReceipts(getReceipts());
  }, []);

  const stats = useMemo(() => {
    const signed = receipts.filter((receipt) => receipt.status === "Wallet signed").length;
    const quoteOnly = receipts.filter((receipt) => receipt.status === "Quote created").length;
    const recipients = new Set(receipts.map((receipt) => receipt.recipientAddress)).size;

    return {
      total: receipts.length,
      signed,
      quoteOnly,
      recipients
    };
  }, [receipts]);

  async function copyReceipt(receipt: Receipt) {
    const text = [
      "OmniRefund Receipt",
      `Refund ID: ${receipt.refundId}`,
      `Refund amount: ${receipt.refundAmount}`,
      `Customer receives: ${receipt.expectedOutput}`,
      `Recipient: ${receipt.recipientAddress}`,
      `Route: ${receipt.route.join(" → ")} via STON.fi Omniston`,
      `Quote ID: ${receipt.quoteId || "n/a"}`,
      `RFQ ID: ${receipt.rfqId || "n/a"}`,
      `Resolver: ${receipt.resolverName || "n/a"}`,
      `Status: ${receipt.status}`,
      `Wallet: ${receipt.walletAddress || "Not connected"}`,
      `BOC hash: ${receipt.transactionBocHash || "Not signed"}`,
      `Created: ${formatDateTime(receipt.createdAt)}`
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopiedId(receipt.refundId);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  function resetHistory() {
    clearReceipts();
    setReceipts([]);
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Merchant Dashboard</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Refund workspace</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          This dashboard is local to your browser. It accumulates every receipt you create from live Omniston quotes during the demo, so judges can see previous refund attempts instead of a static order card.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Receipts created" value={String(stats.total)} />
        <Stat label="Wallet signed" value={String(stats.signed)} />
        <Stat label="Quote receipts" value={String(stats.quoteOnly)} />
        <Stat label="Unique recipients" value={String(stats.recipients)} />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Live refund controls</p>
            <h2 className="mt-2 text-3xl font-black">Create a custom refund</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Enter your own amount, token pair and customer wallet on the refund page. The dashboard will save each live-quote receipt here.
            </p>
          </div>
          <span className="rounded-full bg-cyan-400/15 px-4 py-2 text-sm font-bold text-cyan-100">STON.fi Omniston RFQ</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Connected wallet" value={walletAddress ? shortAddress(walletAddress) : "Not connected yet"} />
          <Info label="Integration status" value="Omniston RFQ + TON Connect" />
          <Info label="Reference order" value={`#${DEMO_ORDER.id} · ${DEMO_ORDER.originalSourceAmount} ${DEMO_ORDER.originalSourceToken} → ${DEMO_ORDER.merchantReceivedAmount} ${DEMO_ORDER.merchantReceivedToken}`} />
          <Info label="Storage" value="local browser receipt history" />
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/refund" className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">
            Create Custom Refund
          </Link>
          <Link href="/success" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15">
            Open Latest Receipt
          </Link>
          {receipts.length > 0 && (
            <button onClick={resetHistory} className="rounded-2xl border border-red-300/20 bg-red-300/10 px-5 py-3 font-bold text-red-100 transition hover:bg-red-300/15">
              Clear Local History
            </button>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Recent refund receipts</p>
            <h2 className="mt-2 text-3xl font-black">Local receipt history</h2>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-slate-200">{receipts.length} saved</span>
        </div>

        {receipts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-6 text-slate-300">
            No receipts yet. Create a live Omniston quote, then save or sign it to add the first receipt here.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {receipts.map((receipt) => (
              <article key={receipt.refundId} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">{receipt.refundId}</h3>
                    <p className="mt-1 text-slate-300">
                      {receipt.refundAmount} → {receipt.expectedOutput} · {receipt.route.join(" → ")}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-100">{receipt.status}</span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <SmallInfo label="Recipient" value={shortAddress(receipt.recipientAddress)} />
                  <SmallInfo label="Wallet" value={shortAddress(receipt.walletAddress)} />
                  <SmallInfo label="Quote ID" value={receipt.quoteId || "n/a"} />
                  <SmallInfo label="Created" value={formatDateTime(receipt.createdAt)} />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/success" className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15">
                    Open latest receipt page
                  </Link>
                  <button onClick={() => copyReceipt(receipt)} className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:border-cyan-200">
                    {copiedId === receipt.refundId ? "Copied!" : "Copy this receipt"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-all text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function SmallInfo({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-bold text-white">{value || "n/a"}</p>
    </div>
  );
}
