import { AppShell } from "@/components/AppShell";
import { LandingHero } from "@/components/LandingHero";

export default function HomePage() {
  return (
    <AppShell>
      <LandingHero />
      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <Card title="Clear use case" text="A TON merchant needs to refund a customer after an order cancellation or payment correction." />
        <Card title="STON.fi Omniston" text="The refund page uses STON.fi API token data and Omniston v1beta8 RFQ for live quote and route discovery." />
        <Card title="TON Connect" text="The refund page connects a live TON wallet and can build a real Omniston transaction for wallet signing." />
      </section>
    </AppShell>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  );
}
