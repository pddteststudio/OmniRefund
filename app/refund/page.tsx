import { AppShell } from "@/components/AppShell";
import { RefundFlow } from "@/components/RefundFlow";

export default function RefundPage() {
  return (
    <AppShell>
      <section className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Refund Flow</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Create a real Omniston refund quote</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Enter an actual amount and customer address → request a live STON.fi Omniston RFQ → connect wallet → save a quote receipt or sign the real Omniston swap transaction.
        </p>
      </section>
      <RefundFlow />
    </AppShell>
  );
}
