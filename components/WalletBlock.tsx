"use client";

import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import { shortAddress } from "@/lib/format";

export function WalletBlock() {
  const address = useTonAddress();

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">TON Connect wallet</p>
          <h2 className="mt-2 text-2xl font-black">Connect merchant wallet</h2>
          <p className="mt-2 text-slate-300">Wallet connection is live through TON Connect. The receipt step stays simulated so no funds move during judging.</p>
        </div>
        <TonConnectButton />
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p className="text-sm text-slate-400">Connected wallet</p>
        <p className="mt-1 break-all text-lg font-bold text-white">{address ? shortAddress(address) : "Not connected"}</p>
      </div>
    </section>
  );
}
