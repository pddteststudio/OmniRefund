import { formatDateTime } from "@/lib/format";
import type { Quote } from "@/types";

export function QuoteCard({ quote, warning }: { quote: Quote; warning?: string }) {
  const isLive = quote.source === "omniston_live";

  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.06] p-6 shadow-glow">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">STON.fi Omniston v1beta8 RFQ</p>
          <h2 className="mt-2 text-3xl font-black">
            {quote.inputAmount} {quote.fromToken} → ~{quote.expectedOutput} {quote.toToken}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {isLive ? "Live quote received from Omniston." : "Fallback quote after live RFQ was unavailable."}
          </p>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-bold ${isLive ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>
          {isLive ? "STON.fi Omniston Live" : "Safe Demo Fallback"}
        </span>
      </div>

      {warning && <p className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{warning}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Route" value={quote.route.join(" → ")} />
        <Metric label="Expected output" value={`${quote.expectedOutput} ${quote.toToken}`} />
        <Metric label="Slippage limit" value={`${quote.slippage}%`} />
        <Metric label="Protocol fee" value={`${quote.fee} ${quote.fromToken}`} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Metric label="Quote ID" value={quote.quoteId} />
        <Metric label="Valid until" value={quote.validUntil ? formatDateTime(quote.validUntil) : "Returned by Omniston"} />
        <Metric label="Resolver" value={quote.resolverName || (isLive ? "Omniston resolver" : "Safe Demo fallback")} />
        <Metric label="Recipient" value={quote.recipientAddress} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-words text-lg font-bold leading-7 text-white">{value}</p>
    </div>
  );
}
