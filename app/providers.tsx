"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Omniston, OmnistonProvider } from "@ston-fi/omniston-sdk-react";

const omniston = new Omniston({
  apiUrl: process.env.NEXT_PUBLIC_OMNISTON_API_URL || "wss://omni-ws.ston.fi"
});

export function Providers({ children }: { children: React.ReactNode }) {
  const manifestUrl =
    process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
    (typeof window !== "undefined" ? `${window.location.origin}/tonconnect-manifest.json` : "/tonconnect-manifest.json");

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <OmnistonProvider omniston={omniston}>{children}</OmnistonProvider>
    </TonConnectUIProvider>
  );
}
