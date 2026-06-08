import Link from "next/link";

export function LandingHero() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-glow backdrop-blur md:p-12">
        <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
          STON.fi track MVP · Omniston v1beta8 RFQ
        </div>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
          Refund router for TON merchants.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Crypto payments are easy to accept, but hard to reverse. OmniRefund lets merchants enter a real refund amount, quote the route through STON.fi Omniston, connect a TON wallet and create a transparent receipt.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">
            Open Demo Dashboard
          </Link>
          <Link href="/refund" className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15">
            View Refund Flow
          </Link>
        </div>
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 backdrop-blur">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">How it works</p>
        <div className="space-y-4">
          {[
            "Customer pays with TON",
            "Merchant receives USDT",
            "Merchant enters amount and customer wallet",
            "Omniston returns a live RFQ route",
            "TON Connect signs the transaction",
            "OmniRefund generates a receipt"
          ].map((item, index) => (
            <div key={item} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-black text-slate-950">
                {index + 1}
              </span>
              <span className="text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
