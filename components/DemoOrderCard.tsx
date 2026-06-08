import Link from "next/link";
import { DEMO_ORDER } from "@/lib/demo-data";
import { formatDateTime, shortAddress } from "@/lib/format";

export function DemoOrderCard() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-glow backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Demo order</p>
          <h2 className="mt-2 text-3xl font-black">Order #{DEMO_ORDER.id}</h2>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-200">Paid · refund available</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Info label="Customer paid" value={`${DEMO_ORDER.originalSourceAmount} ${DEMO_ORDER.originalSourceToken}`} />
        <Info label="Merchant received" value={`${DEMO_ORDER.merchantReceivedAmount} ${DEMO_ORDER.merchantReceivedToken}`} />
        <Info label="Original route" value="TON → USDT" />
        <Info label="Created" value={formatDateTime(DEMO_ORDER.createdAt)} />
        <Info label="Customer address" value={shortAddress(DEMO_ORDER.customerAddress)} />
        <Info label="Merchant address" value={shortAddress(DEMO_ORDER.merchantAddress)} />
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/refund" className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">
          Create Refund
        </Link>
        <Link href="/" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15">
          Back to Landing
        </Link>
      </div>
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
