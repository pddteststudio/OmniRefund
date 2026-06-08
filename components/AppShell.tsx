import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-5 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <p className="font-bold tracking-tight">OmniRefund</p>
              <p className="text-xs text-slate-400">Powered by STON.fi Omniston</p>
            </div>
          </Link>
          <nav className="flex gap-2 text-sm">
            <Link className="rounded-full px-4 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white" href="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300" href="/refund">
              Refund demo
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
