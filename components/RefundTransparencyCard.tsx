export function RefundTransparencyCard() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Refund Transparency</p>
      <h2 className="mt-2 text-2xl font-black">Clear route before wallet confirmation</h2>
      <p className="mt-4 leading-7 text-slate-300">
        This refund is calculated from the amount, token pair and recipient entered by the merchant. The final output may change because token prices and liquidity can move. OmniRefund shows the live Omniston quote, expected output, fees and slippage before the merchant signs anything in the wallet. Funds are never held by OmniRefund.
      </p>
    </section>
  );
}
